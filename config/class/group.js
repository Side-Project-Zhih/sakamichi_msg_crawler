const ApiGenerator = require("../constant/apiGenerator");
const htmlUtil = new (require("../util/htmlGenerator"))();
const downloadUtil = new (require('../util/download'))();
const Msg = require("./msg");
const DATE_FORMAT = "YYYY-MM-DD";
const MEMBERS = require("../constant/memberList");
const GROUPS = require("../constant/groupList");
const mkdirp = require("mkdirp");
const moment = require("moment");
const axios = require("axios");

class Group {
  constructor(group, refreshToken) {
    this.refreshToken = refreshToken;
    this.api = new ApiGenerator(group, refreshToken);
    this.group = group;
    this.groupName = GROUPS[group].name;
    this.memberList = MEMBERS[group];
  }

  async getAccessToken() {
    const payload = { refresh_token: this.refreshToken };
    const res = await axios.post(this.api.updateTokenApi, payload, {
      headers: {
        "X-Talk-App-ID": "jp.co.sonymusic.communication.sakurazaka 2.2",
      },
    });

    const { access_token } = res.data;
    this.accessToken = access_token;
    return access_token;
  }

  async getSubscriptionMembers() {
    try {
      const headers = this.setAuthorization(this.accessToken);
      const { data } = await axios(this.api.subscriptionApi, headers);

      const subscribeMember = [];
      for (const member of data) {
        const { id, subscription } = member;

        if (
          subscription &&
          (subscription.state === "expired" || subscription.state === "active")
        ) {
          const { name, category } = this.memberList[id];
          member.path = `./${this.groupName}/${category}/${name}`;

          await mkdirp(member.path);
          subscribeMember.push(member);
        }
      }

      return subscribeMember;
    } catch (err) {
      if (err.response) {
        await this.getAccessToken();
        return await this.getSubscriptionMembers();
      }
      console.error("get subscriptions error => ", err);
      return;
    }
  }

  setAuthorization(accessToken) {
    return {
      headers: {
        Connection: "keep-alive",
        Accept: "application/json",
        "X-Talk-App-ID": "jp.co.sonymusic.communication.sakurazaka 2.2",
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  async fetchAllMemberData(date) {
    if (!date) {
      date = moment(new Date()).toISOString();
    }

    const members = await this.getSubscriptionMembers();
    for (const member of members) {
      await this.getAccessToken();
      await this.getAllMsg(member, date);
    }
  }

  async getAllMsg(member, startDate) {
    let lastId;
    let currentDate;
    let executeDate;
    const msgMap = {};

    const queryParams = {
      order: "asc",
      startDate,
      count: 200,
    };

    const path = member.path;

    while (true) {
      const { messages, continuation } = await this.getMessage(
        member.id,
        queryParams
      );

      for (const message of messages) {
        const msg = new Msg(message);
        // skip first data if continuation exist
        if (msg.id === lastId) {
          continue;
        }

        currentDate = msg.time.format(DATE_FORMAT);

        if (!msgMap[currentDate]) {
          msgMap[currentDate] = [];
        }

        await msg.downloadFile(`${path}/${currentDate}`);
        const htmlElem = msg.getHtmlContent(
          this.group,
          `${path}/${currentDate}`,
          member.name
        );

        msgMap[currentDate].push(htmlElem);

        if (!executeDate) {
          executeDate = currentDate;
        }

        if (currentDate !== executeDate) {
          const framework = htmlUtil.getFramework(this.group, {
            member: member.name,
          });
          const content = msgMap[executeDate].join("/n");
          const output = framework.addContent(content);

          await fs.promises.writeFile(
            `./${executeDate}.json`,
            JSON.stringify(output)
          );

          await downloadUtil.html(
            `${path}/${executeDate}`,
            msg.time.format(DATE_FORMAT),
            output
          );

          executeDate = formatDate;
        }
      }

      // 該天的msg都已蒐集完成 開始做html
      if (!continuation) {
        const framework = htmlUtil.getFramework(this.group, {
          member: member.name,
        });
        const content = msgMap[executeDate].join("");
        const output = framework.addContent(content);

        await downloadUtil.html(`${path}/${executeDate}`, executeDate, output);

        break;
      }

      startDate = continuation.created_from;
      lastId = continuation.last_item.id;
      queryParams.startDate = startDate;
    }
  }

  async getMessage(memberId, queryParams) {
    try {
      const msgApi = this.getMessageApi(memberId, queryParams);
      const headers = this.setAuthorization(this.accessToken);
      const res = await axios(msgApi, headers);
      let { messages, continuation } = res.data;
      if (continuation) {
        continuation = JSON.parse(
          Buffer.from(continuation, "base64").toString("ascii")
        );
      }
      return { messages, continuation };
    } catch (err) {
      if (err.response) {
        const token = await this.getAccessToken();
        return await this.getMessage(memberId, queryParams);
      }
      console.error("get member message error => ", err);
      return;
    }
  }

  getMessageApi(memberId, queryParams) {
    let output = this.api.baseMessageApi + `/${memberId}/timeline?`;
    for (const key in queryParams) {
      output += `${key}=${queryParams[key]}&`;
    }
    return output;
  }
}

module.exports = Group;
