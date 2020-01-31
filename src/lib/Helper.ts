import * as path from "path"
import * as requester from 'request-promise-native'
import * as fs from 'fs-extra'
import * as mkdirp from 'mkdirp-promise'

const Pageres = require('pageres')

export interface ArgvInterface {
    query: string
    lite: boolean
    api: boolean
    edu: boolean
    egp: boolean
    ecosia: boolean
    bing: boolean
    lilo: boolean
    path: string
    pages: number
    userAgent: string
    resolutions: Array<string>
}

export interface RequestInterface {
    query: string
    basePath: string
    computedPath?: string
    lite: boolean
    api: boolean
    edu: boolean
    egp: boolean
    bing: boolean
    ecosia: boolean
    lilo: boolean
    pages: number
    userAgent: string
    resolutions: Array<string>
}

interface CallArgsInterface {
    baseUrl: string
    pages: number
    loader: (page: number, baseUrl: string) => Promise<void>
    path: string
}

async function call(args: CallArgsInterface): Promise<void> {
    const promises: Array<Promise<void>> = (() => {
        const _promises = [];
        for (var i = 0, j = args.pages; i < j; i++) {
            const _p = args.loader(i + 1, args.baseUrl);
            _promises.push(_p);
        }
        return _promises;
    })();

    await Promise.all(promises)
}


export const builder = {
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
        default: 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion',
    },
    resolutions: {
        type: 'array',
        default: ['1920x1080']
    }
}


export async function takeAshot(request: RequestInterface): Promise<void> {
    const encodedQuery = encodeURI(request.query);

    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-')
    ;

    request.computedPath = path.join(request.basePath, encodedQuery, now);

    console.log('mkdir: ' + request.computedPath);

    await mkdirp(request.computedPath);

    if (request.ecosia)
        await call({
            baseUrl: buildUrlEcosia(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&p=' + (page - 1)
                await new Pageres(
                    {
                        delay: 2
                    })
                    .src(url, request.resolutions)
                    .dest(request.computedPath)
                    .run();

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.computedPath
        });

    if (request.lilo)
        await call({
            baseUrl: buildUrlLilo(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&page=' + page
                await new Pageres(
                    {
                        delay: 2
                    })
                    .src(url, request.resolutions)
                    .dest(request.basePath)
                    .run();

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });

    if (request.bing)
        await call({
            baseUrl: buildUrlBing(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&first=' + (7 * (page + 1))
                await new Pageres(
                    {
                        delay: 2
                    })
                    .src(url, request.resolutions)
                    .dest(request.basePath)
                    .run();

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });

    if (request.edu)
        await call({
            baseUrl: buildUrlJunior(request.query, 'edu'),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });

                const jso = JSON.parse(json);

                if (jso && jso.data & jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                await fs.writeFile(path.join(request.basePath, 'EDU__' + (page + 1) + '.json'), JSON.stringify(jso, null, 2));

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });

    if (request.egp)
        await call({
            baseUrl: buildUrlJunior(request.query, 'egp'),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&count=' + (10 * (page + 1)) + '&offset=' + (page * 10);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });

                const jso = JSON.parse(json);

                if (jso && jso.data & jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                await fs.writeFile(path.join(request.basePath, 'EGP__' + (page + 1) + '.json'), JSON.stringify(jso, null, 2));

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });

    if (request.lite)
        await call({
            baseUrl: buildUrlWeb(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&page=' + page;
                await new Pageres(
                    {
                        delay: 2
                    })
                    .src(url, request.resolutions)
                    .dest(request.basePath)
                    .run();

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });


    if (request.api)
        await call({
            baseUrl: buildUrlApi(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&offset=' + (10 * page);
                const json = await requester({
                    url: url,
                    headers: {
                        'User-Agent': request.userAgent
                    }
                });

                const jso = JSON.parse(json);

                if (jso && jso.data & jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                await fs.writeFile(path.join(request.basePath, (page + 1) + '.json'), JSON.stringify(jso, null, 2));

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.basePath
        });


    console.log('Done.');
}

function buildUrlWeb(query: string) {
    return 'https://lite.qwant.com/?q=' + encodeURI(query) + '&t=web';
}

function buildUrlApi(query: string) {
    return 'https://api.qwant.com/api/search/web?count=10&q=' + encodeURI(query) + '&t=web&device=tablet&safesearch=1&locale=fr_FR&uiv=4'
}

function buildUrlJunior(query: string, juniorKind: string) {
    return 'https://api.qwant.com/' + juniorKind + '/search/web?q=' + encodeURI(query) + '&locale=fr_FR'
}

function buildUrlBing(query: string) {
    return 'https://www.bing.com/search?q=' + encodeURI(query)
}

function buildUrlEcosia(query: string) {
    return 'https://www.ecosia.org/search?q=' + encodeURI(query);
}


function buildUrlLilo(query: string) {
    return 'https://search.lilo.org/results.php?q=' + encodeURI(query);
}
