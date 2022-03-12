const Group = require("./config/class/group");
const moment = require("moment");
const yargs = require("yargs");
const downloadUtil = new (require("./config/util/download"))();
const COMMANDS = require("./config/constant/commandSetting");

const args = yargs.options(COMMANDS).help().argv;

const {
  nogizaka,
  sakurataza,
  hinatazaka,
  n_refresh_token,
  s_refresh_token,
  h_refresh_token,
} = args;

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
  const groupSettings = require("./setting.json");
  const settings = groupSettings[groupName];

  if (!settings.refreshToken && !refreshToken) {
    throw new Error("PLEASE input refresh token");
  }

  if (refreshToken && refreshToken.length !== 36) {
    throw new Error("PLEASE input CORRECT refresh token");
  }

  if (settings.refreshToken && settings.refreshToken.length !== 36) {
    throw new Error(
      "PLEASE input CORRECT refresh token. If you are first time, SHOULD set refresh token to empty string at setting.json"
    );
  }

  if (settings.refreshToken && refreshToken) {
    settings.refreshToken = refreshToken;
  }

  if (!settings.refreshToken && refreshToken) {
    settings.refreshToken = refreshToken;
  }

  if (settings.refreshToken && !refreshToken) {
    refreshToken = settings.refreshToken;
  }

  const group = new Group(groupName, refreshToken);
  let date = moment.utc(new Date());
  const newUpdateDate = moment.utc(date.format("YYYYMMDD")).toISOString();

  await group.fetchAllMemberData(settings.lastUpdateDate, newUpdateDate);
  await downloadUtil.json("./", "setting", groupSettings);
}
