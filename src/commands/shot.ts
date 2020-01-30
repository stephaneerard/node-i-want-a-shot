import * as helper from "../lib/Helper";
import {RequestInterface} from "../lib/Helper";
import * as path from "path";

exports.command = 'shot <query>'
exports.desc = 'take a qwant shot !'

export interface ArgvInterface {
    query?: string
    screenshot: boolean
    api: boolean,
    path: string,
    pages: number
}

exports.builder = {
    screenshot: {
        type: 'boolean',
        default: true,
    },
    api: {
        type: 'boolean',
        default: true
    },
    pages: {
        type: 'number',
        default: 4
    },
    path: {
        type: 'string',
        default: process.cwd()
    }
}
exports.handler = async function (argv: ArgvInterface) {

    const encodedQuery = encodeURI(argv.query);

    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-')
    ;

    const request: RequestInterface = {
        query: argv.query,
        api: argv.api,
        screenshot: argv.screenshot,
        pages: 4,
        path: path.join(argv.path, encodedQuery, now)
    };

    await helper.takeAshot(request);
};
