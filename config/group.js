const ApiGenerator = require("./apiGenerator");
const htmlUtil = new (require("./htmlGenerator"))();
const downloadUtil = new (require("./download"))();
const Msg = require("./msg");

class Group {
  constructor(group, refreshToken) {
    this.refreshToken = refreshToken;
    this.api = new ApiGenerator(group, refreshToken);
    this.group = group;
  }

  async getAccessToken() {
    const payload = { refresh_token: this.refreshToken };
    const res = await axios.post(this.api.updateTokenApi, payload, {
      headers: {
        "X-Talk-App-ID": "jp.co.sonymusic.communication.sakurazaka 2.2",
      },
    });
    const { access_token } = res.data;
    return access_token;
  }

  async getSubscriptionMembers() {
    try {
      const headers = this.setAuthorization(this.accessToken);
      const { data } = await axios(this.api.subscriptionApi, headers);

      data.forEach((item) => {
        const { subscription_detail } = item;
        delete item.id;

        const id = subscription_detail.groups[0];
        item.id = id;
        item.name = this.memberMap[id].name;
      });

      return data;
    } catch (err) {
      if (err.response) {
        const token = await this.getAccessToken();
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

        currentDate = msg.time.format("YYYY-MM-DD");

        if (!msgMap[currentDate]) {
          msgMap[currentDate] = [];
        }

        await msg.downloadFile(path);
        const htmlElem = msg.getHtmlContent(this.group, member.name);

        msgMap[currentDate].push(htmlElem);

        if (!executeDate) {
          executeDate = currentDate;
        }

        if (currentDate !== executeDate) {
          const framework = htmlUtil.getFramework(this.group, member.name);
          const content = msgMap[executeDate].join("/n");
          const output = framework.addContent(content);

          await fs.promises.writeFile(
            `./${executeDate}.json`,
            JSON.stringify(output)
          );

          await downloadUtil.html(path, msg.time.format("YYYY-MM-DD"), output);

          executeDate = formatDate;
        }
      }

      // 該天的msg都已蒐集完成 開始做html
      if (!continuation) {
        const framework = htmlUtil.getFramework(this.group);
        const content = msgMap[executeDate].join("");
        const output = framework.addContent(content);

        await downloadUtil.html(path, msg.time.format("YYYY-MM-DD"), output);

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
    const memberId = this.info.id;
    let output = this.api.baseMessageApi + `/${memberId}/timeline?`;
    for (const key in queryParams) {
      output += `${key}=${queryParams[key]}&`;
    }
    return output;
  }
}

module.exports = Group;
