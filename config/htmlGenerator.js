const TEMPLATE = require("./template");

class HtmlGenerator {
  getFramework(group, info) {
    this.framework = TEMPLATE[group].GET_FRAMEWORK(info);
    return this;
  }
  getPic(group, info) {
    if (content) {
      return TEMPLATE[group].GET_PIC_TEXT(info);
    }
    return TEMPLATE[group].GET_PIC(info);
  }
  getText(group, info) {
    return TEMPLATE[group].GET_TEXT(info);
  }
  getVoice(group, info) {
    return TEMPLATE[group].GET_VOICE(info);
  }
  getVideo(group, info) {
    return TEMPLATE[group].GET_VIDEO(info);
  }
  addContent(content) {
    return this.framework(content);
  }
}

module.exports = HtmlGenerator;
