#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot/DownloadGodot');

async function runTests() {
    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);
};

runTests();