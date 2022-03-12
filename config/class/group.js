const ApiGenerator = require("../constant/apiGenerator");
const htmlUtil = new (require("../util/htmlGenerator"))();
const downloadUtil = new (require("../util/download"))();
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
          member.category = category;
          member.path = `/${this.groupName}/${category}/${name}`;

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
      throw new Error("get subscriptions error => ", err);
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

  async fetchAllMemberData(memberDateMap, newUpdateDate) {
    const members = await this.getSubscriptionMembers();

    for (const member of members) {
      // if (member.id == 29) {
      console.log(`${this.groupName} ${member.category} ${member.name} 下載中`);

      const event = `${member.name} 下載完成`;

      console.time(event);
      await this.getAccessToken();

      const date = memberDateMap[member.name];
      const params = {
        member,
        startDate: date,
      };
      await this.getAllMsg(params);
      memberDateMap[member.name] = newUpdateDate;
      console.timeEnd(event);
      // }
    }
  }

  async getAllMsg(params) {
    let lastId;
    let currentDate;
    let executeDate;
    const msgMap = {};

    const { member, startDate } = params;

    const queryParams = {
      order: "asc",
      count: 200,
    };

    if (startDate) {
      queryParams.created_from = startDate;
    }

    const path = member.path;

    while (true) {
      const { messages, continuation } = await this.getMessage(
        member.id,
        queryParams
      );

      if (!messages || (messages && messages.length === 0)) {
        return;
      }

      for (const message of messages) {
        const msg = new Msg(message);
        // skip first data if continuation exist
        if (msg.id === lastId) {
          continue;
        }

        if (msg.type === "text" && !msg.text) {
          continue;
        }

        currentDate = msg.time.format(DATE_FORMAT);
        await mkdirp(`./${path}/${currentDate}`);

        if (!msgMap[currentDate]) {
          msgMap[currentDate] = [];
        }

        await msg.downloadFile(`.${path}/${currentDate}`);
        const htmlElem = msg.getHtmlContent(
          this.group,
          `${path}/${currentDate}`,
          member.name
        );

        if (htmlElem) {
          msgMap[currentDate].push(htmlElem);
        }

        if (!executeDate) {
          executeDate = currentDate;
        }

        if (currentDate !== executeDate) {
          const framework = htmlUtil.getFramework(this.group, {
            member: member.name,
          });
          const content = msgMap[executeDate].join("");
          const output = framework.addContent(content);

          await downloadUtil.html(
            `.${path}/${executeDate}`,
            executeDate,
            output
          );

          executeDate = currentDate;
        }
      }

      // 該天的msg都已蒐集完成 開始做html
      if (!continuation) {
        const framework = htmlUtil.getFramework(this.group, {
          member: member.name,
        });
        const content = msgMap[executeDate].join("");
        const output = framework.addContent(content);

        await downloadUtil.html(`.${path}/${executeDate}`, executeDate, output);

        break;
      }

      lastId = continuation.last_item.id;
      queryParams.created_from = continuation.created_from;
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

      throw new Error("get member message error => ", err);
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
