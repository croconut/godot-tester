#!/usr/bin/env node
import { setFailed } from '@actions/core';
import downloadGodot from './lib/DownloadGodot.js';
import runGodotImport from './lib/RunGodotImport.js';
import executeGutTests from './lib/ExecuteGutTests.js';
import analyzeTestResults from './lib/AnalyzeTestResults.js';
import getCliArgs from './lib/GetCliArgs.js';

process.env.THIS_ACTION_DIR = __dirname;

interface customError {
  msg: string
}

async function main(): Promise<void> {
  try {
    const input = getCliArgs();
    const exePath = await downloadGodot(input);
    console.log('exePath: ', exePath);

    runGodotImport(input, exePath);
    executeGutTests(input, exePath);
    const results = analyzeTestResults(input);

    console.log('Test count: ', results.testCount);
    console.log('Fail count: ', results.failCount);
    console.log('Passrate: ', results.passRate);
    console.log('Success: ', results.success);
    if (!results.success) {
      throw {msg: 'Test run failed'};
    }
  } catch (e: unknown) {
    // set msg so only custom errors fill messaging
    // all throws that get here must be testing failures
    let customErr = e as customError;
    if (customErr) {
      setFailed(customErr.msg);
    } else {
      setFailed('Unexpected error while testing');
    }
    process.exit(1);
  }
  process.exit(0);
};

main();
