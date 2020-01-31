"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Helper_1 = require("../lib/Helper");
exports.command = 'shot <query>';
exports.desc = 'take a qwant shot !';
exports.builder = Helper_1.builder;
exports.handler = async function (argv) {
    const request = {
        query: argv.query,
        api: argv.api,
        lite: argv.lite,
        edu: argv.edu,
        egp: argv.egp,
        ecosia: argv.ecosia,
        bing: argv.bing,
        lilo: argv.lilo,
        pages: argv.pages,
        basePath: argv.path,
        userAgent: argv.userAgent,
        resolutions: argv.resolutions,
    };
    await Helper_1.takeAshot(request);
};
//# sourceMappingURL=shot.js.map