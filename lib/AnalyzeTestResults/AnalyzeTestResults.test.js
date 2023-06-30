jest.mock('../GetProjectPath/GetProjectPath', () => jest.fn(() => 'projectPath'));

const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

const getProjectPath = require('../GetProjectPath/GetProjectPath');

const analyzeTestResults = require('./AnalyzeTestResults');
describe('analyzeTestResults', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getProjectPath.mockReturnValue('/home/runner/work/projectPath');
        fs.readFileSync.mockImplementation(() => {
            const actualReadFileSync = jest.requireActual('fs').readFileSync;

            return actualReadFileSync(
                path.join(
                    __dirname,
                    '../',
                    '../',
                    'test_fixtures',
                    'testResults.xml',
                ),
            );
        })

        yargs.argv = {
            ...yargs.argv,
            assertCheck: false,
            resultOutputFile: 'testResults.xml',
            minimumPass: 0,
            maxFails: undefined,
        };
    });

    it('should read the test results file', () => {
        analyzeTestResults();
        expect(fs.readFileSync).toHaveBeenCalledWith('/home/runner/work/projectPath/testResults.xml');
    });

    describe('when the test results file is empty', () => {
        it('should raise an error', () => {
            fs.readFileSync.mockReturnValue('');
            expect(() => analyzeTestResults()).toThrowError('No test results found: results file is empty');
        });
    });

    describe('when the test results file is not found', () => {
        it('should raise an error', () => {
            fs.readFileSync.mockImplementation(() => { throw new Error('File not found'); });
            expect(() => analyzeTestResults()).toThrowError('File not found');
        });
    });

    describe('if it finds no tests', () => {
        it('should raise an error', () => {
            fs.readFileSync.mockReturnValue(
                '<testsuites></testsuites >'
            );
            expect(() => analyzeTestResults()).toThrowError('No test results found');
        });

        it('should raise an error', () => {
            fs.readFileSync.mockReturnValue(
                '<testsuites><testsuite></testsuite></testsuites >'
            );
            expect(() => analyzeTestResults()).toThrowError('No test results found');
        });
    });

    describe('if it finds tests', () => {
        describe('with assert by check enabled', () => {
            beforeEach(() => {
                yargs.argv.assertCheck = true;
            });

            describe('with no failures', () => {
                it('should return success', () => {
                    fs.readFileSync.mockReturnValue(
                        `
                        <testsuites>
                            <testsuite>
                                <testcase assertions="1" status="pass" />
                                <testcase assertions="1" status="pass" />
                            </testsuite>
                            <testsuite>
                                <testcase assertions="1" status="pass" />
                                <testcase assertions="1" status="pass" />
                            </testsuite>
                            <testsuite>
                                <testcase assertions="1" status="pass" />
                                <testcase assertions="1" status="pass" />
                            </testsuite>
                            <testsuite>
                                <testcase assertions="2" status="pass" />
                                <testcase assertions="2" status="pass" />
                            </testsuite>
                        </testsuites>
                        `
                    );

                    expect(analyzeTestResults()).toEqual({
                        testCount: 10,
                        failCount: 0,
                        passRate: 1,
                        success: true,
                    });
                });
            });
            describe('with failures', () => {
                beforeEach(() => {
                    fs.readFileSync.mockReturnValue(
                        `
                        <testsuites>
                            <testsuite>
                                <testcase assertions="3" status="pass" />
                                <testcase assertions="2" status="fail">
                                    <failure>Failure</failure>
                                </testcase>
                            </testsuite>
                            <testsuite>
                                <testcase assertions="3" status="pass" />
                                <testcase assertions="2" status="fail">
                                    <failure>Failure</failure>
                                </testcase>
                            </testsuite>
                        </testsuites>
                        `
                    );
                })

                describe('with passRate below the threshold', () => {
                    it('should return failure', () => {
                        yargs.argv.minimumPass = 0.9;
                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 2,
                            passRate: 0.8,
                            success: false,
                        });
                    });
                });

                describe('with failures above the max fails threshold', () => {
                    it('should return failure', () => {
                        yargs.argv.maxFails = 0;

                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 2,
                            passRate: 0.8,
                            success: false,
                        });
                    });
                });

                describe('with passRate above the threshold', () => {
                    it('should return success', () => {
                        yargs.argv.minimumPass = 0.6;

                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 2,
                            passRate: 0.8,
                            success: true,
                        });
                    });
                });
            });
        });

        describe('with assert by test enabled', () => {
            beforeEach(() => {
                yargs.argv.assertCheck = false;
            });

            describe('with no failures', () => {
                it('should return success', () => {
                    fs.readFileSync.mockReturnValue(
                        `
                        <testsuites failures="0" tests="10">
                            <testsuite>
                                <testcase></testcase>
                            </testsuite>
                            <testsuite>
                                <testcase></testcase>
                            </testsuite>
                        </testsuites>
                        `
                    );

                    expect(analyzeTestResults()).toEqual({
                        testCount: 10,
                        failCount: 0,
                        passRate: 1,
                        success: true,
                    });
                });
            });

            describe('with passRate', () => {
                beforeEach(() => {
                    fs.readFileSync.mockReturnValue(
                        `
                        <testsuites failures="5" tests="10">
                            <testsuite>
                                <testcase></testcase>
                            </testsuite>
                            <testsuite>
                                <testcase></testcase>
                            </testsuite>
                        </testsuites>
                        `
                    );

                    yargs.argv.minimumPass = 0.4;
                    yargs.argv.maxFails = 6;
                });

                describe('with passRate below the threshold', () => {
                    it('should return failure', () => {
                        yargs.argv.minimumPass = 0.8;
                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 5,
                            passRate: 0.5,
                            success: false,
                        });
                    });
                });

                describe('with failures above the max fails threshold', () => {
                    it('should return failure', () => {
                        yargs.argv.maxFails = 1;
                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 5,
                            passRate: 0.5,
                            success: false,
                        });
                    });
                });

                describe('with passRate above the threshold', () => {
                    it('should return success', () => {
                        expect(analyzeTestResults()).toEqual({
                            testCount: 10,
                            failCount: 5,
                            passRate: 0.5,
                            success: true,
                        });
                    });
                });
            });
        });
    });
});