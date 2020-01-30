"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper = require("../lib/Helper");
const path = require("path");
exports.command = 'shot <query>';
exports.desc = 'take a qwant shot !';
exports.builder = {
    lite: {
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
    },
    'user-agent': {
        type: 'string',
        default: 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion',
    },
    resolutions: {
        type: 'array',
        default: ['1920x1080']
    }
};
exports.handler = async function (argv) {
    const encodedQuery = encodeURI(argv.query);
    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-');
    const request = {
        query: argv.query,
        api: argv.api,
        lite: argv.lite,
        pages: 4,
        path: path.join(argv.path, encodedQuery, now),
        userAgent: argv.userAgent,
        resolutions: argv.resolutions
    };
    await helper.takeAshot(request);
};
//# sourceMappingURL=shot.js.map