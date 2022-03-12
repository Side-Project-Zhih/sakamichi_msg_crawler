const TEMPLATE = {
  nogi: {
    GET_FRAMEWORK: (info) => {
      const { member } = info;
      return (content) => `
      <!DOCTYPE html>
      <html lang="en">

      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="//vjs.zencdn.net/7.3.0/video-js.min.css" rel="stylesheet">
        <link rel="stylesheet" href="/asset/css/nogizaka.css">

        <title>Document</title>
      </head>

      <body>
        <div id="app">
          <div data-v-25197153="" id="home">
            <div data-v-25197153="" class="container">
              <div data-v-25197153="" contenteditable="plaintext-only" spellcheck="false"
                class="talk-header talk-header-nogi">${member}</div>
              <div data-v-25197153=""><span data-v-25197153="">
                  ${content}
              </div>
            </div>
          </div>
          <script src="//vjs.zencdn.net/7.3.0/video.min.js"></script>
      </body>

      </html>
      `;
    },
    GET_TEXT: (info) => {
      const { file, time, content, member } = info;
      return `
      <div data-v-25197153="" class="talk-item">
        <div data-v-25197153="" contenteditable="true" class="talk-avatar"><img data-v-25197153=""
            src="/asset/pic/group/nogi/nogi_member_${member}.jpg"></div>
        <div data-v-25197153="" class="talk-msg">
          <div data-v-25197153="" class="msg-info">
            <div data-v-25197153="">${member}</div>
            <div data-v-25197153="" contenteditable="true" spellcheck="false" style="min-width: 30px;">${time}
            </div>
          </div>
          <div data-v-25197153="" class="msg-bubble">
            <div data-v-25197153="" class="content-wrapper"><img data-v-25197153="" hidden="hidden" crossorigin="anonymous"
                contenteditable="true">
              <div data-v-25197153="" contenteditable="true" spellcheck="false" class="msg-content" style="min-height: 20px;">
                ${content}
              </div>
              <!---->
            </div>
          </div>
        </div>
      </div>
      `;
    },
    GET_PIC: (info) => {
      const { file, time, content, member } = info;
      return `
      <div data-v-25197153="" class="talk-item">
        <div data-v-25197153="" contenteditable="true" class="talk-avatar"><img data-v-25197153=""
            src="/asset/pic/group/nogi/nogi_member_${member}.jpg"></div>
        <div data-v-25197153="" class="talk-msg">
          <div data-v-25197153="" class="msg-info">
            <div data-v-25197153="">${member}</div>
            <div data-v-25197153="" contenteditable="true" spellcheck="false" style="min-width: 30px;">${time}
            </div>
          </div>
          <div data-v-25197153="" class="msg-bubble">
            <div data-v-25197153="" class="content-wrapper">
              <!-- 有圖片 -->
              <img src="${file}" data-v-25197153="" crossorigin="anonymous" contenteditable="true">   
            </div>
          </div>
        </div>
      </div>
      `;
    },
    GET_PIC_TEXT: (info) => {
      const { file, time, content, member } = info;
      return `
      <div data-v-25197153="" class="talk-item">
        <div data-v-25197153="" contenteditable="true" class="talk-avatar"><img data-v-25197153=""
            src="/asset/pic/group/nogi/nogi_member_${member}.jpg"></div>
        <div data-v-25197153="" class="talk-msg">
          <div data-v-25197153="" class="msg-info">
            <div data-v-25197153="">${member}</div>
            <div data-v-25197153="" contenteditable="true" spellcheck="false" style="min-width: 30px;">${time}
            </div>
          </div>
          <div data-v-25197153="" class="msg-bubble">
            <div data-v-25197153="" class="content-wrapper">
              <!-- 有圖片 -->
              <img src="${file}" data-v-25197153="" crossorigin="anonymous" contenteditable="true">
              <!-- 有文字 -->
              <div data-v-25197153="" spellcheck="false" class="msg-content" style="min-height: 20px;">
                ${content}</div>
            </div>
          </div>
        </div>
      </div>
      `;
    },
    GET_VOICE: (info) => {
      const { file, time, content, member } = info;

      return `
      <div data-v-25197153="" class="talk-item" draggable="false">
        <div data-v-25197153="" contenteditable="true" class="talk-avatar"><img data-v-25197153=""
            src="/asset/pic/group/nogi/nogi_member_${member}.jpg" draggable="false"></div>
        <div data-v-25197153="" class="talk-msg">
          <div data-v-25197153="" class="msg-info">
            <div data-v-25197153="">${member}</div>
            <div data-v-25197153="" contenteditable="true" spellcheck="false" style="min-width: 30px;">${time}
            </div>
          </div>
          <div data-v-25197153="" class="msg-bubble">
            <div data-v-25197153="" class="content-wrapper"><img data-v-25197153="" hidden="hidden" crossorigin="anonymous"
                draggable="false">
              <video src="${file}" controls style="width: 95%; height: 50px;"></video>
            </div>
          </div>
        </div>
      </div>
      `;
    },
    GET_VIDEO: (info) => {
      const { file, time, content, member } = info;
      return `
        <div data-v-25197153="" class="talk-item">
          <div data-v-25197153="" contenteditable="true" class="talk-avatar"><img data-v-25197153=""
              src="/asset/pic/group/nogi/nogi_member_${member}.jpg"></div>
          <div data-v-25197153="" class="talk-msg">
            <div data-v-25197153="" class="msg-info">
              <div data-v-25197153="">${member}</div>
              <div data-v-25197153="" contenteditable="true" spellcheck="false" style="min-width: 30px;">${time}
              </div>
            </div>
            <div data-v-25197153="" class="msg-bubble">
              <div data-v-25197153="" class="content-wrapper">
                <div class="msg-video">
                  <video id="video" class="video-js  vjs-big-play-centered " preload="auto" controls data-setup="{}">
                    <source src="${file}" type="">
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
    },
  },
};
module.exports = TEMPLATE;
