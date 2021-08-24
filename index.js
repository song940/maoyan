const https = require('https');
const assert = require('assert');
const cheerio = require('cheerio');

const headers = {
  //
};

const get = (url, options = { headers }) =>
  new Promise(done => https.get(url, options, done));

const parseHTML = html => cheerio.load(html);
const readStream = (stream, buffer = '') =>
  new Promise((resolve, reject) => stream
    .on('error', reject)
    .on('data', chunk => buffer += chunk)
    .on('end', () => resolve(buffer)));


const ensureStatusCode = expected => {
  if (!Array.isArray(expected))
    expected = [expected];
  return res => {
    const { statusCode } = res;
    assert.ok(expected.includes(statusCode), `status code must be "${expected}" but actually "${statusCode}"`);
    return res;
  };
}

const parseMovie = $ => {
  const name = $('.movie-brief-container > .name').text();
  const ename = $('.movie-brief-container > .ename').text();
  const cover = $('.avatar').attr('src');
  const introduction = $('.dra').text();
  const categories = [];
  $('.movie-brief-container > ul a').each((i, item) => {
    categories.push($(item).text().trim());
  });
  const celebrities = [];
  $('.tab-celebrity .celebrity-group').each((i, item) => {
    const type = $('.celebrity-type', item).contents().first().text().trim();
    $('.celebrity-list li', item).each((i, item) => {
      const name = $('img', item).attr('alt').trim();
      const avatar = $('img', item).attr('data-src');
      const role = $('.role', item).text().replace('饰：', '');
      celebrities.push({
        type,
        name,
        role,
        avatar,
      });
    });
  });
  const images = [];
  $('.tab-img img').each((i, img) => {
    const url = $(img).attr('data-src');
    const index = url.indexOf('@');
    images.push(url.substring(0, index));
  });
  return {
    name,
    ename,
    cover,
    images,
    categories,
    introduction,
    celebrities,
  };
};

module.exports = ({ } = {}) => {
  return {
    movie(id) {
      return Promise
        .resolve()
        .then(() => get(`https://maoyan.com/films/${id}`))
        .then(ensureStatusCode(200))
        .then(readStream)
        .then(parseHTML)
        .then(parseMovie);
    }
  };
};