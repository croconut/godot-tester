#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot/DownloadGodot');

async function runTests() {
    process.env.NODE_DIR = __dirname;

    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);
};

runTests();