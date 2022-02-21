const axios = require("axios");
const download = require("download");
const fs = require("fs");
const ROOT = "https://api.n46.glastonr.net/v2";

(async () => {
  //loading last download date
  //只記錄 該天起頭 ex: 2022-01-010:00:00,
  const STARTDATE = new Date();
  const { lastUpdatedDate, refresh_token } = require("setting.json");
  //refresh access token
  const { access_token } = (await axios.post(update, headers)).data;
  //get subscription members
  const subscriptions = (await axios.get(sub, headers)).data;
  const members = subscriptions.map(
    (item) => item.subscription_detail.group[0]
  );

  //GET data by Date
  let executeDate = "";
  let currentDate = "";
  const msgMap = {};
  const queryUrl = ``;
  while (true) {
    const { data } = await axios.get(queryUrl, headers);
    const { messages, continuation } = data;
    messages.forEach((message) => {
      currentDate = message.published_at;
      const { text, pic, video } = message;
      //deal with text/pic/video

      if (!msgMap[currentDate]) {
        msgMap[currentDate] = [];
      }

      //pic
      if (pic) {
        const picElem = transformToHtml(pic, "pic");
        await download(pic);
        msgMap[currentDate].push(picElem);
      }
      //video
      if (video) {
        const videoElem = transformToHtml(pic, "video");
        await download(video);
        msgMap[currentDate].push(videoElem);
      }
      //text
      if (text) {
        const textElem = transformToHtml(pic, "text");
        msgMap[currentDate].push(textElem);
      }

      //該天的msg都已蒐集完成 開始做html
      if (currentDate !== executeDate) {
        const htmlContent = injectToTemplate(msgMap[executeDate]);
        const path = ``;
        executeDate = currentDate;
        await fs.promises.writeFile(path, htmlContent);
      }
    });
    if (!continuation) {
      //deal with last 
      const htmlContent = injectToTemplate(msgMap[executeDate]);
      const path = ``;
      await fs.promises.writeFile(path, htmlContent);
      //save into setting.json
      const refreshInfo = {
        lastUpdatedDate: STARTDATE,
        refresh_token,
      };
      await fs.promises("./setting.json", refreshInfo);
      break;
    }
  }
})();
