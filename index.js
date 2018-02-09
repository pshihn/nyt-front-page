const fs = require("fs");
const NYT = require('./nyt.js');

console.log("Loading config file...");
const configContent = fs.readFileSync("config.json");
const config = JSON.parse(configContent);
if (!config.apiKey) {
  console.error("No api key provided in the config");
  process.exit(0);
}
if (!config.query) {
  console.error("No query specified in the config");
  process.exit(0);
}
if (!config.startDate) {
  console.error("No start date provided in the config");
  process.exit(0);
}
if (!config.endDate) {
  console.error("No end date provided in the config");
  process.exit(0);
}
console.log("Config loaded");

const nyt = new NYT(config);
nyt.run().then(() => {
  console.log("END");
}).catch((err) => {
  console.error("ERROR", err);
  nyt.spitOutput();
  process.exit(0);
})
