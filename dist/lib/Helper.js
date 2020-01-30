"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const requester = require("request-promise-native");
const fs = require("fs-extra");
const mkdirp = require("mkdirp-promise");
const Pageres = require('pageres');
async function takeAshot(request) {
    console.log('mkdir: ' + request.path);
    await mkdirp(request.path);
    if (request.screenshot) {
        const baseUrl = buildUrlWeb(request.query);
        console.log('weblite: ' + baseUrl);
        const call = async (page) => {
            const url = baseUrl + '&page' + (page + 1);
            console.log('weblite: page:' + page + ' ' + url);
            await new Pageres({
                delay: 2,
                script: 'window.scrollTo(1920, 1)'
            })
                .src(url, ['1920x1080'])
                .dest(request.path)
                .run();
        };
        const promises = (() => {
            const promises = [];
            for (var i = 0, j = request.pages; i < j; i++) {
                promises.push(call(i));
            }
            return promises;
        })();
        await Promise.all(promises);
    }
    if (request.api) {
        const baseUrl = buildUrlApi(request.query);
        console.log('api: ' + baseUrl);
        const call = async (page) => {
            const url = baseUrl + '&offset=' + (10 * request.pages);
            console.log('api: page:' + page + ': ' + url);
            const json = await requester({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion'
                }
            });
            const jso = JSON.parse(json);
            jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                .toISOString()
                .replace(/:/g, '-')
                .replace(/\./g, '-');
            await fs.writeFile(path.join(request.path, (page + 1) + '.json'), JSON.stringify(jso, null, 2));
        };
        const promises = (() => {
            const promises = [];
            for (var i = 0, j = request.pages; i < j; i++) {
                promises.push(call(i));
            }
            return promises;
        })();
        await Promise.all(promises);
        console.log('Done.');
    }
}
exports.takeAshot = takeAshot;
function buildUrlWeb(query) {
    return 'https://lite.qwant.com/?q=' + encodeURI(query) + '&t=web';
}
function buildUrlApi(query) {
    return 'https://api.qwant.com/api/search/web?count=10&q=' + encodeURI(query) + '&t=web&device=tablet&safesearch=1&locale=fr_FR&uiv=4';
}
//# sourceMappingURL=Helper.js.map