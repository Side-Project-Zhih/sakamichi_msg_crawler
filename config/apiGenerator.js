const axios = require("axios");
const { MEMBERS } = require("./member");
const API_BASE = {
  GET_UPDATE_TOKEN: {
    nogi: "https://api.n46.glastonr.net/v2/update_token",
    sakura: "https://api.s46.glastonr.net/v2/update_token",
  },
  GET_SUBSCRIPTION: {
    nogi: "https://api.n46.glastonr.net/v2/receipts",
    sakura: "https://api.s46.glastonr.net/v2/receipts",
  },
  GET_MESSAGE: {
    nogi: "https://api.n46.glastonr.net/v2/groups",
    sakura: "https://api.s46.glastonr.net/v2/groups",
  },
};
class API_GENERATOR {
  constructor(type, refreshToken) {
    this.updateTokenApi = API_BASE.GET_UPDATE_TOKEN[type];
    this.subscriptionApi = API_BASE.GET_SUBSCRIPTION[type];
    this.baseMessageApi = API_BASE.GET_MESSAGE[type];
    this.refreshToken = refreshToken;
    this.memberMap = MEMBERS[type];
  }
  async getAccessToken() {
    const payload = { refresh_token: this.refreshToken };
    const res = await axios.post(this.updateTokenApi, payload, {
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
      const { data } = await axios(this.subscriptionApi, headers);
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
        return await this.getMessage(memberId, queryParams);
      }
      console.error("get subscriptions error => ", err);
      return;
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

  setAuthorization(token) {
    return {
      headers: {
        Connection: "keep-alive",
        Accept: "application/json",
        "X-Talk-App-ID": "jp.co.sonymusic.communication.sakurazaka 2.2",
        Authorization: `Bearer ${token}`,
      },
    };
  }
  getMessageApi(memberId, queryParams) {
    let output = this.baseMessageApi + `/${memberId}/timeline?`;
    for (const key in queryParams) {
      output += `${key}=${queryParams[key]}&`;
    }
    return output;
  }
}

module.exports = API_GENERATOR;
