#!/usr/bin/env node
import { setFailed, setOutput } from '@actions/core'
import downloadGodot from './lib/DownloadGodot.js'
import runGodotImport from './lib/RunGodotImport.js'
import executeGutTests from './lib/ExecuteGutTests.js'
import analyzeTestResults, { type Results } from './lib/AnalyzeTestResults.js'
import getCliArgs from './lib/GetCliArgs.js'

process.env.THIS_ACTION_DIR = __dirname

interface customError {
  msg: string
}

let results: Results

async function main (): Promise<void> {
  try {
    const input = getCliArgs()
    const exePath = await downloadGodot(input)
    console.log('exePath: ', exePath)

    runGodotImport(input, exePath)
    executeGutTests(input, exePath)
    results = analyzeTestResults(input)

    console.log('Test count: ', results.testCount)
    console.log('Fail count: ', results.failCount)
    console.log('Passrate: ', results.passRate)
    console.log('Success: ', results.success)

    if (!results.success) {
      throw { msg: 'Test run failed' }
    }
  } catch (e: unknown) {
    // set msg so only custom errors fill messaging
    // all throws that get here must be testing failures
    const customErr = e as customError
    if (typeof e === 'object' && e !== null && 'msg' in e) {
      setFailed(customErr.msg)
    } else {
      setFailed('Unexpected error while testing')
    }
    if (results !== undefined) {
      setOutput('pass-rate', results.passRate)
    } else {
      setOutput('pass-rate', 0)
    }
    setOutput('success', 0)
    process.exit(1)
  }
  setOutput('pass-rate', results.passRate)
  setOutput('success', 1)
  process.exit(0)
};

// this would normally be a good error, but i actually dont care to await the main function
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
