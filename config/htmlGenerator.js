const TEMPLATE = {
  nogi: {
    GET_FRAMEWORK: (info) => {
      return (content) => `${info} ${content} `;
    },
    TEXT: "",
    PIC: "",
    PIC_TEXT: "",
    VOICE: "",
    VIDEO: "",
  },
};
class HtmlGenerator {
  constructor(group) {
    this.template = TEMPLATE[group];
  }

  getFramework(info) {
    this.icon = info.icon;
    this.framework = this.template.GET_FRAMEWORK(info);
    return this;
  }
  getPic(filename, content, time) {}
  getText(content, time) {}
  getVoice(filename, time) {}
  getVideo(filename, time) {}
  addContent(content) {
    return this.framework(content);
  }
}

module.exports = HtmlGenerator;
