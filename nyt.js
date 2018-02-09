const moment = require('moment');
const fetch = require('node-fetch');

class NYT {
  constructor(config) {
    this.config = config;
  }

  async run() {
    this.m = moment(this.config.startDate, "YYYYMMDD");
    this.endM = moment(this.config.endDate, "YYYYMMDD");
    this.counts = {};
    this.logCounter = 0;
    this.errorCounter = 0;
    return await this.next();
  }

  spitOutput() {
    console.log("RESULT:\n\n\n");
    console.log(JSON.stringify(this.counts));
  }

  delay(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  async next() {
    if (this.m.isSame(this.endM, 'day')) {
      this.spitOutput();
      return;
    }
    const date = this.m.format("YYYYMMDD");
    let next = moment(date, "YYYYMMDD");
    next.add(1, "days");
    const nextDate = next.format("YYYYMMDD");

    if (this.logCounter % 10 === 0) {
      console.log("Fetching for " + date);
    }

    let result = await this.fetchNextCount(date, nextDate);
    if (result.status === "OK") {
      this.errorCounter = 0;
      let hits = result.response.meta.hits;
      this.counts[date] = hits;
      if (!hits) {
        console.log("* No hits fond for " + date);
      }
      this.logCounter++;
      this.m.add(1, "days");
      await this.delay(800);
      return await this.next();
    } else {
      console.log("err", result);
      let delay = (this.errorCounter + 1) * 5;
      this.errorCounter++;
      console.log("Waiting " + delay + " seconds");
      await this.delay(delay * 1000);
      return await this.next();
    }
  }

  async fetchNextCount(date, nextDate) {
    let url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=' + encodeURIComponent(this.config.apiKey)
      + "&q=" + encodeURIComponent(this.config.query)
      + "&fq=" + encodeURIComponent('print_page:1')
      + "&begin_date=" + date
      + "&end_date=" + nextDate
      + "&fl=print_page%2Cpub_date";
    return await fetch(url).then(res => res.json());
  }
};

module.exports = NYT;