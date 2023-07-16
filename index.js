#!/usr/bin/env node
const downloadGodot = require('./lib/DownloadGodot');
const runGodotImport = require('./lib/RunGodotImport');
const executeGutTests = require('./lib/ExecuteGutTests');
const analyzeTestResults = require('./lib/AnalyzeTestResults');

// eslint-disable-next-line require-jsdoc
async function runTests() {
  try {
    process.env.THIS_ACTION_DIR = __dirname;
    const exePath = await downloadGodot();
    console.log('exePath: ', exePath);

    runGodotImport(exePath);
    executeGutTests(exePath);
    const results = analyzeTestResults();

    console.log('Test count: ', results.testCount);
    console.log('Fail count: ', results.failCount);
    console.log('Passrate: ', results.passRate);
    console.log('Success: ', results.success);
    if (!results.success) {
      throw {msg: 'Test run failed'};
    }
  } catch (e) {
    // set msg so only custom errors fill messaging
    // all throws that get here must be testing failures
    core.setFailed(error.msg ?? 'Unexpected error while testing');
    process.exit(1);
  }
  process.exit(0);
};

runTests();
