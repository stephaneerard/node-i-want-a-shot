import * as path from "path"
import * as requester from 'request-promise-native'
import * as fs from 'fs-extra'
import * as mkdirp from 'mkdirp-promise'
import * as PQueue from 'p-queue'

const Pageres = require('pageres');

export interface ArgvInterface {
    config: string
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
    'concurrency-api': number
    'concurrency-jpg': number
}

export interface RequestInterface {
    config?: string
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
    'concurrency-api': number
    'concurrency-jpg': number
}

interface CallArgsInterface {
    baseUrl: string
    pages: number
    loader: (page: number, baseUrl: string) => Promise<void>
    path: string
    queue: PQueue.Queue<any>
}


async function call(args: CallArgsInterface): Promise<void> {
    const promises: Array<Promise<void>> = (() => {
        const _promises = [];
        for (let i = 0, j = args.pages; i < j; i++) {
            const _p = (<any>(args.queue)).add(() => {
                return args.loader(i + 1, args.baseUrl)
            });
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
}
let configured = false;

export function configure(params: { concurrency_jpg: number, concurrency_api: number }) {
    queues['jpg'] = new PQueue.default({concurrency: params.concurrency_jpg});
    queues['api'] = new PQueue.default({concurrency: params.concurrency_api});
    configured = true;
}

export async function takeAshot(request: RequestInterface): Promise<void> {
    if (!configured)
        configure({concurrency_api: request["concurrency-api"], concurrency_jpg: request["concurrency-jpg"]});

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
            queue: <any>queues['jpg'],
            baseUrl: buildUrlEcosia(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&p=' + (page - 1);
                await new Pageres(
                    {
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
            queue: <any>queues['jpg'],
            baseUrl: buildUrlLilo(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&page=' + page;
                await new Pageres(
                    {
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
            queue: <any>queues['jpg'],
            baseUrl: buildUrlBing(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&first=' + (7 * (page + 1));
                await new Pageres(
                    {
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
            queue: <any>queues['api'],
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

                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                const jsonFilepath = path.join(request.computedPath, 'EDU__' + page + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));

                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });

    if (request.egp)
        await call({
            queue: <any>queues['api'],
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

                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                const jsonFilepath = path.join(request.computedPath, 'EGP__' + (page + 1) + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));

                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });

    if (request.lite)
        await call({
            queue: <any>queues['jpg'],
            baseUrl: buildUrlWeb(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&page=' + page;
                await new Pageres(
                    {
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
            queue: <any>queues['api'],
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

                if (jso && jso.data && jso.data.cache && jso.data.cache.created)
                    jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                        .toISOString()
                        .replace(/:/g, '-')
                        .replace(/\./g, '-')
                    ;

                const jsonFilepath = path.join(request.computedPath, 'API__' + page + '.json');
                await fs.writeFile(jsonFilepath, JSON.stringify(jso, null, 2));

                console.log('Done %s %s', url, jsonFilepath);
            },
            pages: request.pages,
            path: request.computedPath
        });


    console.log('Done %s', request.computedPath);
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
