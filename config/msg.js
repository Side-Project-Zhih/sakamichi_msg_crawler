const moment = require("moment");
const downloadUtil = new (require("./download"))();
const htmlUtil = new (require("./htmlGenerator"))();
const DATE_FORMAT = "YYYY-MM-DD";

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

  async getHtmlContent(group) {
    let output;
    if (this.type === "video") {
      output = htmlUtil.getVideo(
        group,
        this.filename,
        this.time.format(DATE_FORMAT)
      );
    } else if (this.type === "voice") {
      output = htmlUtil.getVoice(
        group,
        this.filename,
        this.time.format(DATE_FORMAT)
      );
    } else if (this.type === "picture") {
      if (this.text) {
        output = htmlUtil.getPic(
          group,
          this.filename,
          this.time.format(DATE_FORMAT),
          this.text
        );
      } else {
        output = htmlUtil.getPic(
          group,
          this.filename,
          this.time.format(DATE_FORMAT)
        );
      }
    } else if (this.type === "text") {
      output = htmlUtil.getText(
        group,
        this.text,
        this.time.format(DATE_FORMAT)
      );
    }
    this.htmlElem = output;
    return output;
  }
}

module.exports = Msg;
