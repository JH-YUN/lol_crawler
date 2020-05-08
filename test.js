const puppeteer = require('puppeteer');
const crawler = require('./index.js');

const champion = {
  "id":"Akali","key":"84","name":"Akali"
};

async function test() {
  const browser = await puppeteer.launch();

  // console.log(crawler);
  await crawler.get_data(champion, browser);
  await browser.close();
}

test();
