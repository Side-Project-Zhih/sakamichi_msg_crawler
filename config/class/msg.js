const moment = require("moment");
const downloadUtil = new (require("../util/download"))();
const htmlUtil = new (require("../util/htmlGenerator"))();
const DATE_FORMAT = "YYYY/MM/DD HH:mm";

class Msg {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.file = data.file;
    this.text = data.text;
    this.time = moment(data.published_at);
    this.filename = this.time.unix();
  }

  async downloadFile(path) {
    if (this.type === "video") {
      await downloadUtil.video(path, `${this.filename}.mp4`, this.file);
    } else if (this.type === "voice") {
      await downloadUtil.voice(path, `${this.filename}.mp4`, this.file);
    } else if (this.type === "picture") {
      await downloadUtil.picture(path, `${this.filename}.jpg`, this.file);
    }
  }

  getHtmlContent(group, path, member) {
    const info = {
      time: this.time.format(DATE_FORMAT),
      member,
    };
    let output;
    if (this.type === "video") {
      info.file = `${this.filename}.mp4`;
      output = htmlUtil.getVideo(group, info);
    } else if (this.type === "voice") {
      info.file = `${this.filename}.mp4`;
      output = htmlUtil.getVoice(group, info);
    } else if (this.type === "picture") {
      info.file = `${this.filename}.jpg`;
      if (this.text) {
        info.content = this.text;
      }
      output = htmlUtil.getPic(group, info);
    } else if (this.type === "text" && this.text) {
      info.content = this.text;
      output = htmlUtil.getText(group, info);
    }

    this.htmlElem = output;
    return output;
  }
}

module.exports = Msg;
