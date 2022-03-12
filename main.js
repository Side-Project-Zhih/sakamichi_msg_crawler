const Group = require("./config/class/group");
const moment = require("moment");
const yargs = require("yargs");

const args = yargs
  .options({
    nogizaka: {
      // demandOption: true,
      alias: "n",
      describe: "chose group nogizaka",
      boolean: true,
    },
    sakurataza: {
      alias: "s",
      describe: "chose group sakuraza",
      boolean: true,
    },
    hinatazaka: {
      alias: "h",
      describe: "chose group hinatazaka",
      boolean: true,
    },
    nogizaka_refresh_token: {
      alias: "n_refresh_token",
      describe: "please input nogizaka refresh token",
      string: true,
    },
    sakurataza_refresh_token: {
      alias: "s_refresh_token",
      describe: "please input sakurataza refresh token",
      string: true,
    },
    hinatazaka_refresh_token: {
      alias: "h_refresh_token",
      describe: "please input hinatazaka refresh tokn",
      string: true,
    },
  })
  .help().argv;

const {
  nogizaka,
  sakurataza,
  hinatazaka,
  n_refresh_token,
  s_refresh_token,
  h_refresh_token,
} = args;
console.log(args);
let group;
let refreshToken;

if (nogizaka) {
  group = "nogi";
  if (n_refresh_token) {
    refreshToken = n_refresh_token;
  }
} else if (sakurataza) {
  group = "sakura";
  if (s_refresh_token) {
    refreshToken = n_refresh_token;
  }
} else if (hinatazaka) {
  group = "hinata";
  if (h_refresh_token) {
    refreshToken = n_refresh_token;
  }
}

if (!group) {
  throw new Error("PLEASE input group");
}

if (refreshToken) {
  main(group, refreshToken);
} else {
  main(group);
}

async function main(groupName, refreshToken) {
  const groupSettings = require("./setting.json")[groupName];
  // NN
  if (!groupSettings.refreshToken && !refreshToken) {
    throw new Error("PLEASE input refresh token");
  }

  if (refreshToken && refreshToken.length !== 36) {
    throw new Error("PLEASE input CORRECT refresh token");
  }

  if (groupSettings.refreshToken && groupSettings.refreshToken.length !== 36) {
    throw new Error("PLEASE input CORRECT refresh token");
  }

  if (groupSettings.refreshToken && refreshToken) {
    groupSettings.refreshToken = refreshToken;
  }

  if (!groupSettings.refreshToken && refreshToken) {
    groupSettings.refreshToken = refreshToken;
  }

  if (groupSettings.refreshToken && !refreshToken) {
    refreshToken = groupSettings.refreshToken;
  }

  // const group = new Group(groupName, refreshToken);
  // let date = moment.utc(new Date());
  // const newUpdateDate = moment.utc(date.format("YYYYMMDD")).toISOString();

  // await group.fetchAllMemberData(settings.lastUpdateDate);

  // settings.lastUpdateDate = newUpdateDate;
  // await downloadUtil.json("./", "setting", groupSettings);
}
