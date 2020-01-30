#!/usr/bin/env node

import * as yargs from "yargs";

yargs
    .commandDir('./commands', {})
    .help()
    .version()
    .demandCommand(1)
    .argv
