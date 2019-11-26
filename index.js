require("dotenv").config();

const open = require("open");
const winston = require("winston");
const discord = require("discord.js");
const client = new discord.Client();
const config = require("./config.json");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // - Write all logs to console.
    new winston.transports.Console(),
    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // - Write to all logs with level `info` and below to `combined.log`
    new winston.transports.File({ filename: "combined.log" })
  ]
});

const matchUrls = text => {
  const urls = text.match(
    /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g
  );

  if (urls) {
    return urls;
  } else {
    return [];
  }
};

client.on("ready", () => {
  logger.info(`Ready to open link as ${client.user.tag}`);
});

client.on("message", message => {
  const urls = new Set(matchUrls(message.content));
  if (urls.length == 0) return;

  urls.forEach(async url => {
    if (
      config.keywords.some(keyword =>
        url.toLowerCase().includes(keyword.toLowerCase())
      ) &&
      !config.negativeKeywords.some(
        keyword => keyword && url.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      logger.info(`Opening ${url}`);
      open(url);
    } else {
      logger.info(`${url} not in keywords or is in negative keywords`);
    }
  });
});

client.login(process.env.DISCORD_TOKEN);
