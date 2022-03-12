const axios = require("axios");
const MEMBERS  = require("./memberList");
const API_BASE = {
  GET_UPDATE_TOKEN: {
    nogi: "https://api.n46.glastonr.net/v2/update_token",
    sakura: "https://api.s46.glastonr.net/v2/update_token",
  },
  GET_SUBSCRIPTION: {
    nogi: "https://api.n46.glastonr.net/v2/groups",
    sakura: "https://api.s46.glastonr.net/v2/groups",
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
}

module.exports = API_GENERATOR;
