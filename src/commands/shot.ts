import {ArgvInterface, builder, RequestInterface, takeAshot} from "../lib/Helper";

exports.command = 'shot <query>'
exports.desc = 'take a qwant shot !'
exports.builder = builder;
exports.handler = async function (argv: ArgvInterface) {

    const request: RequestInterface = {
        query: argv.query,
        config: argv.config,
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
        "concurrency-api": argv["concurrency-api"],
        "concurrency-jpg": argv["concurrency-jpg"],
    };

    await takeAshot(request);
};
