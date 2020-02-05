"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const requester = require("request-promise-native");
const fs = require("fs-extra");
const mkdirp = require("mkdirp-promise");
const PQueue = require("p-queue");
const Pageres = require('pageres');
async function call(args) {
    const promises = (() => {
        const _promises = [];
        for (let i = 0, j = args.pages; i < j; i++) {
            const _p = (args.queue).add(() => {
                return args.loader(i + 1, args.baseUrl);
            });
            _promises.push(_p);
        }
        return _promises;
    })();
    await Promise.all(promises);
}
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
    }
};
const queues = {
    'jpg': null,
    'api': null
};
let configured = false;
function configure(params) {
    queues['jpg'] = new PQueue.default({ concurrency: params.concurrency_jpg });
    queues['api'] = new PQueue.default({ concurrency: params.concurrency_api });
    configured = true;
}
exports.configure = configure;
async function takeAshot(request) {
    if (!configured)
        configure({ concurrency_api: request["concurrency-api"], concurrency_jpg: request["concurrency-jpg"] });
    const encodedQuery = encodeURI(request.query);
    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-');
    request.computedPath = path.join(request.basePath, encodedQuery, now);
    console.log('mkdir: ' + request.computedPath);
    await mkdirp(request.computedPath);
    if (request.ecosia)
        await call({
            queue: queues['jpg'],
            baseUrl: buildUrlEcosia(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&p=' + (page - 1);
                await new Pageres({
                    delay: 2
                })
                    .src(url, request.resolutions)
                    .dest(request.computedPath)
                    .run();
                console.log('Done %s %s', url, request.computedPath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.lilo)
        await call({
            queue: queues['jpg'],
            baseUrl: buildUrlLilo(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&page=' + page;
                await new Pageres({
                    delay: 2
                })
                    .src(url, request.resolutions)
                    .dest(request.computedPath)
                    .run();
                console.log('Done %s %s', url, request.computedPath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.bing)
        await call({
            queue: queues['jpg'],
            baseUrl: buildUrlBing(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&first=' + (7 * (page + 1));
                await new Pageres({
                    delay: 2
                })
                    .src(url, request.resolutions)
                    .dest(request.computedPath)
                    .run();
                console.log('Done %s %s', url, request.computedPath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.edu)
        await call({
            queue: queues['api'],
            baseUrl: buildUrlJunior(request.query, 'edu'),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });
                const jso = JSON.parse(json);
                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-');
                const jsonFilepath = path.join(request.computedPath, 'EDU__' + page + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));
                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.egp)
        await call({
            queue: queues['api'],
            baseUrl: buildUrlJunior(request.query, 'egp'),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });
                const jso = JSON.parse(json);
                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-');
                const jsonFilepath = path.join(request.computedPath, 'EGP__' + (page + 1) + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));
                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.lite)
        await call({
            queue: queues['jpg'],
            baseUrl: buildUrlWeb(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&page=' + page;
                await new Pageres({
                    delay: 2
                })
                    .src(url, request.resolutions)
                    .dest(request.computedPath)
                    .run();
                console.log('Done %s %s', url, request.computedPath);
            },
            pages: request.pages,
            path: request.computedPath
        });
    if (request.api)
        await call({
            queue: queues['api'],
            baseUrl: buildUrlApi(request.query),
            loader: async (page, baseUrl) => {
                const url = baseUrl + '&offset=' + (10 * page);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });
                const jso = JSON.parse(json);
                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-');
                const jsonFilepath = path.join(request.computedPath, 'API__' + page + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));
                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });
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