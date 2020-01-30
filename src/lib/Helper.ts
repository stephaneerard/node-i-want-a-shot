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
}

export async function takeAshot(request: RequestInterface): Promise<void> {
    console.log('mkdir: ' + request.path);

    await mkdirp(request.path);

    if (request.screenshot) {
        const baseUrl = buildUrlWeb(request.query);
        console.log('weblite: ' + baseUrl);

        const call = async (page: number): Promise<void> => {
            const url = baseUrl + '&page' + (page + 1);
            console.log('weblite: page:' + page + ' ' + url);
            await new Pageres(
                {
                    delay: 2,
                    script: 'window.scrollTo(1920, 1)'
                })
                .src(url, ['1920x1080'])
                .dest(request.path)
                .run();
        }

        const promises: Array<Promise<void>> = (() => {

            const promises = [];

            for (var i = 0, j = request.pages; i < j; i++) {
                promises.push(call(i));
            }

            return promises;
        })();

        await Promise.all(promises)
    }

    if (request.api) {
        const baseUrl = buildUrlApi(request.query)
        console.log('api: ' + baseUrl);

        const call = async (page: number): Promise<void> => {
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
                .replace(/\./g, '-')
            ;

            await fs.writeFile(path.join(request.path, (page + 1) + '.json'), JSON.stringify(jso, null, 2));
        }

        const promises: Array<Promise<void>> = (() => {

            const promises = [];

            for (var i = 0, j = request.pages; i < j; i++) {
                promises.push(call(i));
            }

            return promises;
        })();

        await Promise.all(promises)

        console.log('Done.')
    }

}

function buildUrlWeb(query: string) {
    return 'https://lite.qwant.com/?q=' + encodeURI(query) + '&t=web';
}

function buildUrlApi(query: string) {
    return 'https://api.qwant.com/api/search/web?count=10&q=' + encodeURI(query) + '&t=web&device=tablet&safesearch=1&locale=fr_FR&uiv=4'
}
