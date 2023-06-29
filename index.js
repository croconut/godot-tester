#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot/DownloadGodot');

async function runTests() {
    process.env.THIS_ACTION_DIR = __dirname;

    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);
};

runTests();