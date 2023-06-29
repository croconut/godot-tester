#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot/DownloadGodot');
const runGodotImport = require('./lib/RunGodotImport/RunGodotImport');
const executeGutTests = require('./lib/ExecuteGutTests/ExecuteGutTests');

async function runTests() {
    process.env.THIS_ACTION_DIR = __dirname;

    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);

    runGodotImport(exePath);
    executeGutTests(exePath);
    // TODO: analyze test results
    // analyzeTestResults(); 
};

runTests();