const TEMPLATE = require("./template");

class HtmlGenerator {
  getFramework(group, info) {
    this.framework = TEMPLATE[group].GET_FRAMEWORK(info);
    return this;
  }
  getPic(group, info) {
    const { file, time, content, member } = info;
    if (content) {
      return TEMPLATE[group].GET_PIC_TEXT;
    }
    return TEMPLATE[group].GET_PIC;
  }
  getText(group, info) {
    const { file, time, content, member } = info;
    return TEMPLATE[group].GET_TEXT;
  }
  getVoice(group, info) {
    const { file, time, member } = info;
    return TEMPLATE[group].GET_VOICE;
  }
  getVideo(group, info) {
    const { file, time, member } = info;
    return TEMPLATE[group].GET_VIDEO;
  }
  addContent(content) {
    return this.framework(content);
  }
}

module.exports = HtmlGenerator;
