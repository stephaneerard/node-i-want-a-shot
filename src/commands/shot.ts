import * as helper from "../lib/Helper";
import {RequestInterface} from "../lib/Helper";
import * as path from "path";

exports.command = 'shot <query>'
exports.desc = 'take a qwant shot !'

export interface ArgvInterface {
    query: string
    lite: boolean
    api: boolean
    edu: boolean
    egp: boolean
    path: string
    pages: number
    userAgent: string
    resolutions: Array<string>
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
exports.handler = async function (argv: ArgvInterface) {

    const encodedQuery = encodeURI(argv.query);

    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-')
    ;

    const request: RequestInterface = {
        query: argv.query,
        api: argv.api,
        lite: argv.lite,
        edu: argv.edu,
        egp: argv.egp,
        pages: 4,
        path: path.join(argv.path, encodedQuery, now),
        userAgent: argv.userAgent,
        resolutions: argv.resolutions
    };

    await helper.takeAshot(request);
};
