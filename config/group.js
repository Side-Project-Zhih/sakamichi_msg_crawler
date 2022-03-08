const ApiGenerator = require("./apiGenerator");
const Member = require("./member");
const HtmlGenerator = require("./htmlGenerator");

class Group {
  constructor(group, refreshToken) {
    this.refreshToken = refreshToken;
    this.api = new ApiGenerator(group, refreshToken);
    this.htmlUtil = new HtmlGenerator(group);
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
      date = await this.getAllMsg(member, date);
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
    const framework = this.htmlUtil.getFramework(member);
    while (true) {
      const { messages, continuation } = await this.getMessage(
        member.id,
        queryParams
      );
      for (const message of messages) {
        // skip first data if continuation exist
        if (message.id === lastId) {
          continue;
        }

        currentDate = new Date(message.published_at);
        const formatDate = `${currentDate.getFullYear()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getDate()}`;

        const { type, text } = message;
        // //deal with text/pic/video

        if (!msgMap[formatDate]) {
          msgMap[formatDate] = [];
        }

        let htmlElem;
        // //pic
        if (type === "picture") {
          // const picElem = transformToHtml(pic, "pic");
          // await download(pic);

          if (text) {
            msgMap[formatDate].push({
              name: "picture",
              date: currentDate,
              text,
            });

            htmlElem = this.htmlUtil.getPic(filename, text, time);
          } else {
            htmlElem = this.htmlUtil.getPic(filename, text, time);
          }
        }
        // //video
        else if (type === "video") {
          // const videoElem = transformToHtml(pic, "video");
          // await download(video);
          // if (text) {
          //   msgMap[formatDate].push({
          //     name: "video",
          //     date: currentDate,
          //     text,
          //   });
          // } else {
          //   msgMap[formatDate].push({ name: "video", date: currentDate });
          // }
          htmlElem = this.htmlUtil.getVideo(filename, time);
        } else if (type === "voice") {
          // const videoElem = transformToHtml(pic, "video");
          // await download(video);
          // if (text) {
          //   msgMap[formatDate].push({
          //     name: "voice",
          //     date: currentDate,
          //     text,
          //   });
          // } else {
          //   msgMap[formatDate].push({ name: "voice", date: currentDate });
          // }
          htmlElem = this.htmlUtil.getVoice(filename, time);
        }
        // //text
        else if (type === "text") {
          // const textElem = transformToHtml(pic, "text");
          htmlElem = this.htmlUtil.getText(filename, time);
        }

        msgMap[formatDate].push(htmlElem);

        if (!executeDate) {
          executeDate = formatDate;
        }

        if (formatDate !== executeDate) {
          // const htmlContent = injectToTemplate(msgMap[executeDate]);
          // const path = ``;
          const content = msgMap[executeDate];
          const output = framework.addContent(content);

          await fs.promises.writeFile(
            `./${executeDate}.json`,
            JSON.stringify(output)
          );
          executeDate = formatDate;
        }
      }

      // 該天的msg都已蒐集完成 開始做html
      if (!continuation) {
        const content = msgMap[executeDate];
        await fs.promises.writeFile(
          `./${executeDate}.json`,
          JSON.stringify(content)
        );
        break;
      }
      startDate = continuation.created_from;
      lastId = continuation.last_item.id;
      queryParams.startDate = startDate;
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
