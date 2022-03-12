const download = require("download");
const fs = require("fs");
const axios = require("axios");

class DownloadUtil {
  async picture(path, filename, url) {
    try {
      await download(url, path, { filename });
      return true;
    } catch (err) {
      console.error(err);
    }
  }
  async video(path, filename, url) {
    try {
      const res = await axios(url, { responseType: "arraybuffer" });
      await fs.promises.writeFile(`${path}/${filename}`, res.data);
      return true;
    } catch (err) {
      console.error(err);
    }
  }
  async voice(path, filename, url) {
    try {
      const res = await axios(url, { responseType: "arraybuffer" });
      await fs.promises.writeFile(`${path}/${filename}`, res.data);
      return true;
    } catch (err) {
      console.error(err);
    }
  }
  async html(path, filename, content) {
    try {
      await fs.promises.writeFile(`${path}/${filename}.html`, content);
      return true;
    } catch (err) {
      console.error(err);
    }
  }
  async json(path, filename, content) {
    await fs.promises.writeFile(
      `${path}/${filename}.json`,
      JSON.stringify(content)
    );
  }
}

module.exports = DownloadUtil;
