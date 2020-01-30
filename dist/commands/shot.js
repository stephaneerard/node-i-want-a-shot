"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper = require("../lib/Helper");
const path = require("path");
exports.command = 'shot <query>';
exports.desc = 'take a qwant shot !';
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
};
exports.handler = async function (argv) {
    const encodedQuery = encodeURI(argv.query);
    const now = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-');
    const request = {
        query: argv.query,
        api: argv.api,
        screenshot: argv.screenshot,
        pages: 4,
        path: path.join(argv.path, encodedQuery, now)
    };
    await helper.takeAshot(request);
};
//# sourceMappingURL=shot.js.map