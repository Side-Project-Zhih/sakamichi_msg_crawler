const COMMANDS = {
  nogizaka: {
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
};

module.exports = COMMANDS;
