#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot/DownloadGodot');
const runGodotImport = require('./lib/RunGodotImport/RunGodotImport');
const executeGutTests = require('./lib/ExecuteGutTests/ExecuteGutTests');
const analyzeTestResults = require('./lib/AnalyzeTestResults/AnalyzeTestResults');

async function runTests() {
    process.env.THIS_ACTION_DIR = __dirname;

    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);

    runGodotImport(exePath);
    executeGutTests(exePath);
    const results = analyzeTestResults(); 

    console.log("Test count: ", results.testCount);
    console.log("Fail count: ", results.failCount);
    console.log("Passrate: ", results.passRate);
    console.log("Success: ", results.success);

    if(!results.success) {
        process.exit(1);
    };
};

runTests();