"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const requester = require("request-promise-native");
const fs = require("fs-extra");
const mkdirp = require("mkdirp-promise");
const Chain = require("@frenchex/chained-promise-event-emitter-lib");
const log4js = require("@log4js-node/log4js-api");
exports.builder = {
    lite: {
        type: 'boolean',
        default: true,
        description: 'Take a LITE shot !'
    },
    api: {
        type: 'boolean',
        default: true,
        description: 'Take an API shot !'
    },
    edu: {
        type: 'boolean',
        default: true,
        description: 'Take a JUNIOR/EDU shot !'
    },
    egp: {
        type: 'boolean',
        default: true,
        description: 'Take a JUNIOR/EGP shot !'
    },
    bing: {
        type: 'boolean',
        default: true,
        description: 'Take a BING shot !'
    },
    ecosia: {
        type: 'boolean',
        default: true,
        description: 'Take a ECOSIA shot !'
    },
    lilo: {
        type: 'boolean',
        default: true,
        description: 'Take a LILO shot !'
    },
    pages: {
        type: 'number',
        default: 4
    },
    path: {
        type: 'string',
        default: process.cwd()
    },
    'user-agent': {
        type: 'string',
        default: 'Mozilla/5.0 (platform; rv:1) Gecko/1.4 Firefox/60',
    },
    resolutions: {
        type: 'array',
        default: ['1920x1080']
    },
    config: {
        type: 'string',
        default: null,
        description: 'Configuration file'
    },
    'concurrency-jpg': {
        type: 'number',
        default: 2,
        description: 'Concurrency jpg'
    },
    'concurrency-api': {
        type: 'number',
        default: 10,
        description: 'Concurrency api'
    },
    'delay-ms': {
        type: 'number',
        default: 400,
        description: 'Delay between requests'
    }
};
const logger = log4js.getLogger('app');
logger.level = 'debug';
const chain = new Chain.ChainedPromiseEventEmitter(logger);
function call(args) {
    const innerChain = new Chain.ChainedPromiseEventEmitter(logger);
    for (let i = 0, j = args.pages; i < j; i++) {
        innerChain
            .chain('url', (resolve, reject) => {
            console.log('url %s %s', i + 1, args.baseUrl);
            setTimeout(() => {
                args.loader(i + 1, args.baseUrl)
                    .then(resolve)
                    .catch(reject);
            }, args["delay-ms"]);
        });
    }
    chain.chain(args.baseUrl, (resolve, reject) => {
        innerChain
            .promise()
            .then(() => {
            resolve();
            console.log('Done %s %s', args.baseUrl, args.pages);
        })
            .catch(reject);
        innerChain.run();
    });
}
const queues = {
    'jpg': null,
    'api': null
};
async function consumeApi(url, page, baseUrl, request, kind, outFileExt) {
    const json = await (async () => {
        try {
            return (await requester({
                url: url,
                headers: {
                    'User-Agent': request.userAgent,
                    'accept-language': 'en-US,en;q=0.9',
                    'sec-fetch-mode': 'no-cors',
                    'sec-fetch-site': 'same-site',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                }
            })).toString();
        }
        catch (e) {
            console.error(e);
            return {
                _internalShotError: true,
                error: JSON.stringify(e.toString(), null, 2)
            };
        }
    })();
    const jso = (() => {
        try {
            return json[0] === '{' ? JSON.parse(json) : json;
        }
        catch (e) {
            return json;
        }
    })();
    if (jso && 'object' === typeof jso && jso.data && jso.data.cache && jso.data.cache.created)
        jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
            .toISOString()
            .replace(/:/g, '-')
            .replace(/\./g, '-');
    const jsonFilepath = path.join(request.computedPath, kind + '__' + page + '.' + outFileExt);
    await fs.writeFile(jsonFilepath, 'object' === typeof jso ? JSON.stringify(jso, null, 2) : json);
    console.log('Done %s %s', url, jsonFilepath);
}
async function takeAshot(request) {
    const encodedQuery = encodeURI(request.query);
    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-');
    request.computedPath = path.join(request.basePath, encodedQuery, now);
    console.log('mkdir: ' + request.computedPath);
    chain.chain('mkdir', (resolve, reject) => {
        return mkdirp(request.computedPath);
    });
    if (request.ecosia)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlEcosia(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                return consumeApi(url, page, baseUrl, request, 'ecosia', 'html');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.lilo)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlLilo(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                return consumeApi(url, page, baseUrl, request, 'lilo', 'html');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.bing)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlBing(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                return consumeApi(url, page, baseUrl, request, 'bing', 'html');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.edu)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlJunior(request.query, 'edu'),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                return consumeApi(url, page, baseUrl, request, 'edu', 'json');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.egp)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlJunior(request.query, 'egp'),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                return consumeApi(url, page, baseUrl, request, 'egp', 'json');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.lite)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlWeb(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&page=' + page;
                return consumeApi(url, page, baseUrl, request, 'lite', 'html');
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.api)
        call({
            "delay-ms": request["delay-ms"],
            baseUrl: buildUrlApi(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&offset=' + (10 * page);
                return consumeApi(url, page, baseUrl, request, 'api', 'json');
            },
            pages: request.pages,
            path: request.computedPath
        });
    await chain.run();
    console.log('Done %s', request.computedPath);
}
exports.takeAshot = takeAshot;
function buildUrlWeb(query) {
    return 'https://lite.qwant.com/?q=' + encodeURI(query) + '&t=web';
}
function buildUrlApi(query) {
    return 'https://api.qwant.com/api/search/web?count=10&q=' + encodeURI(query) + '&t=web&device=tablet&safesearch=1&locale=fr_FR&uiv=4';
}
function buildUrlJunior(query, juniorKind) {
    return 'https://api.qwant.com/' + juniorKind + '/search/web?q=' + encodeURI(query) + '&locale=fr_FR';
}
function buildUrlBing(query) {
    return 'https://www.bing.com/search?q=' + encodeURI(query);
}
function buildUrlEcosia(query) {
    return 'https://www.ecosia.org/search?q=' + encodeURI(query);
}
function buildUrlLilo(query) {
    return 'https://search.lilo.org/results.php?q=' + encodeURI(query);
}
//# sourceMappingURL=Helper.js.map