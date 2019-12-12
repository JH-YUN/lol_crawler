const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const opggUrl = 'https://www.op.gg/champion';


async function get_position_spell(champion) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(opggUrl + '/' + champion);

  const position = await page.$$eval(
    '.champion-stats-header__position',
    divs => divs.map(div => div.dataset.position)
  );
  const spell = await page.$$eval('.champion-overview__table--summonerspell img.tip', el => el.map(el => /\/spell\/(.*)\.png/.exec(el.src)).map(el => el[1]));
  await browser.close();

  await position.map(position => get_skill(champion, position));


}

async function get_item(champion, position) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(opggUrl + '/' + champion + '/statistics/' + position + '/item');

  const itemList = await page.$$('.champion-box');
  const mainItemHandle = itemList[0];
  const shoesHandle = itemList[1];
  const startItemHandle = itemList[2];

  let startItem = await startItemHandle.$$eval('.champion-stats__list img', el => el.map(el => /\/item\/(.*)\.png/.exec(el.src)).map(el => el[1]));
  startItem = startItem.filter((item, index) => startItem.indexOf(item) === index);

  let mainItem = await mainItemHandle.$$eval('.champion-stats__list .champion-stats__list__item img', el => el.map(el => /\/item\/(.*)\.png/.exec(el.src)).map(el => el[1]));
  mainItem = mainItem.filter((item, index) => mainItem.indexOf(item) === index);

  let shoes = await shoesHandle.$$eval('.champion-stats__single__item img', el => el.map(el => /\/item\/(.*)\.png/.exec(el.src)).map(el => el[1]));


  await browser.close();
}

async function get_skill(champion, position) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(opggUrl + '/' + champion + '/statistics/' + position + '/skill');

  const skillHandle = await page.$$(".champion-box-content");
  // const skillMasterHtml = await page.$$(".champion-box-content").evaluate();
  const skillMasterHtml = await skillHandle[0].evaluate(e => e.outerHTML);
  const skillFirst3LevelHtml = await skillHandle[1].evaluate(e => e.outerHTML);

  const skillMasterCheerio = cheerio.load(skillMasterHtml);
  const skillFirst3LevelCheerio = cheerio.load(skillFirst3LevelHtml);
  // console.log(skillFirst3LevelHtml);
  let skillMaster = new Array();
  let skillFirst3Level = new Array();
  // console.log(skillMasterCheerio);
  // console.log(skillMasterCheerio('.champion-stats__filter_item_value--winrate').first().children('span').text());
  skillMasterCheerio('.champion-stats__filter__item.tabHeader').not('.champion-stats__filter__item--all').each(function (i, e) {
    let obj = new Object();
    obj.order = skillMasterCheerio(e).find('li.champion-stats__list__item.tip').children('span').text();
    obj.pick = skillMasterCheerio(e).find('div.champion-stats__filter__item__value').eq(0).find('b').text();
    skillMaster.push(obj);
  })
  skillFirst3LevelCheerio('tr[role="row"]').not('.tablesorter-headerRow').each(function (i, e) {
    if (i < 2) {
      let obj = new Object();
      obj.order = skillFirst3LevelCheerio(e).find('.champion-stats__table__cell--data').find('td').eq(0).text().trim();
      obj.order += skillFirst3LevelCheerio(e).find('.champion-stats__table__cell--data').find('td').eq(1).text().trim();
      obj.order += skillFirst3LevelCheerio(e).find('.champion-stats__table__cell--data').find('td').eq(2).text().trim();
      obj.pick = skillFirst3LevelCheerio(e).find('.champion-stats__table__cell--pickrate').text().trim();
      let num = skillFirst3LevelCheerio(e).find('.champion-stats__table__cell--pickrate').find('em').text();
      obj.pick = obj.pick.replace(num, '');
      skillFirst3Level.push(obj);
    }
  })

  await browser.close();

}

async function get_rune(championId, position) {
  // https://www.op.gg/champion/ajax/statistics/runeList/championId=13&position=MID
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(opggUrl + '/' + champion + '/statistics/' + position + '/rune');

  const runeHTML = await page.$eval(".champion-box-content", e => e.outHTML);
  const runeCheerio = cheerio.load(runeHTML);
  runeCheerio('.champion-stats__filter__item.tabHeader').not('.champion-stats__filter__item--all').each(function (i, e) {
    let obj = new Object();

    obj.mainRune = runeCheerio(e).find('img').eq(1).src;
  }

  await browser.close();
}

get_position_spell('ryze');
