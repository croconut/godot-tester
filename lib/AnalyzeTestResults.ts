import { readFileSync } from 'fs'
import { join } from 'path'
import { XMLParser } from 'fast-xml-parser'

import { type ActionInput } from './GetCliArgs.js'

export interface Results {
  testCount: number
  failCount: number
  passRate: number
  success: boolean
}

function analyzeTestResults (input: Readonly<ActionInput>): Results {
  const { resultOutputFile, projectPath, assertCheck, minimumPass, maxFails } = input
  const resultPath = join(
    projectPath,
    resultOutputFile
  )

  const testResults = readFileSync(resultPath)
  const stringResults = testResults.toString()
  if (stringResults === '') {
    throw { msg: 'No test results found: results file is empty' }
  };

  const parser = new XMLParser({ ignoreAttributes: false })
  const testResultsObj = parser.parse(stringResults)

  // if there were not test suites to run, throw an error
  if (typeof testResultsObj?.testsuites?.testsuite === 'undefined') {
    throw { msg: 'No test results found' }
  };

  let testCount = 0
  let failCount = 0

  if (assertCheck) {
    const testsuites = testResultsObj.testsuites
    let testSuiteObjects = testsuites.testsuite

    // if there is only one test suite, it will be an object
    // if there are multiple test suites, they will be an array of objects

    // if there is only one test suite, convert it to an array
    if (!Array.isArray(testSuiteObjects)) {
      testSuiteObjects = [testSuiteObjects]
    };

    testSuiteObjects.forEach(({ testcase: testCaseObjects }) => {
      // if there are no test cases in this suite, skip it
      // <testsuite></testsuite>
      if (testCaseObjects === undefined) return

      // if there is only one test case, it will be an object
      // if there are multiple test cases, they will be an array of objects

      // if there is only one test case, convert it to an array
      if (!Array.isArray(testCaseObjects)) {
        testCaseObjects = [testCaseObjects]
      };

      testCaseObjects.forEach((caseObj: any) => {
        // this is the <testcase> object, nested under testsuites>testsuite
        // the test case contains the number of assertions and a child node
        // <failure> if the test failed
        const caseAssertions = parseInt(caseObj['@_assertions'])
        testCount += caseAssertions

        const caseFailed = caseObj.failure
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (caseFailed) failCount++
      })
    })
  } else {
    // this is the root level <testsuites> object
    // the test count and fail count are attributes of this object
    testCount = parseInt(testResultsObj.testsuites['@_tests'])
    failCount = parseInt(testResultsObj.testsuites['@_failures'])
  }

  const passRate = (testCount - failCount) / testCount

  let success = false
  const meetsPassRate = passRate >= minimumPass
  let meetsMaxFails = true
  if (typeof maxFails === 'number') {
    meetsMaxFails = failCount <= maxFails
  }

  if (meetsPassRate && meetsMaxFails) {
    success = true
  };

  return {
    testCount,
    failCount,
    passRate,
    success
  }
};

export default analyzeTestResults
