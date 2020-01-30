import * as path from "path"
import * as requester from 'request-promise-native'
import * as fs from 'fs-extra'
import * as mkdirp from 'mkdirp-promise'

const Pageres = require('pageres')

export interface RequestInterface {
    query: string
    path: string
    screenshot: boolean
    api: boolean
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

export async function takeAshot(request: RequestInterface): Promise<void> {
    console.log('mkdir: ' + request.path);

    await mkdirp(request.path);

    if (request.screenshot) {
        await call({
            baseUrl: buildUrlWeb(request.query),
            loader: async (page: number, baseUrl: string): Promise<void> => {
                const url = baseUrl + '&page=' + page;
                await new Pageres(
                    {
                        delay: 2
                    })
                    .src(url, request.resolutions)
                    .dest(request.path)
                    .run();

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.path
        })
    }

    if (request.api) {
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

                jso.data.cache.createdFormattedDate = new Date(jso.data.cache.created * 1000)
                    .toISOString()
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                ;

                await fs.writeFile(path.join(request.path, (page + 1) + '.json'), JSON.stringify(jso, null, 2));

                console.log('Done ' + url);
            },
            pages: request.pages,
            path: request.path
        });
    }

    console.log('Done.')
}

function buildUrlWeb(query: string) {
    return 'https://lite.qwant.com/?q=' + encodeURI(query) + '&t=web';
}

function buildUrlApi(query: string) {
    return 'https://api.qwant.com/api/search/web?count=10&q=' + encodeURI(query) + '&t=web&device=tablet&safesearch=1&locale=fr_FR&uiv=4'
}
