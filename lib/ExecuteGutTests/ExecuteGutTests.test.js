jest.mock('child_process', () => ({
    spawnSync: jest.fn(),
}));

jest.mock('../GetProjectPath/GetProjectPath', () => (
    jest.fn().mockReturnValue('/path/to/project')
));

const { spawnSync } = require('child_process')
const yargs = require("yargs");

const executeGutTests = require('./ExecuteGutTests');

describe('executeGutTests', () => {
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        spawnSync.mockReturnValue({
            error: null,
            status: 0,
            stdout: {
                toString: jest.fn(() => 'stdout'),
            }
        });

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        yargs.argv = {
            godotVersion: '3.2.3',
            testDir: 'res://test',
            testTimeout: 30,
            directScene: 'false',
            resultOutputFile: 'test_results.xml',
            configFile: 'res://.gutconfig.json',
        }
    })

    describe('when directScene is given', () => {
        beforeEach(() => {
            yargs.argv.directScene = 'res://test/test_scene.tscn';
        });

        it('should execute the exe with the direct-scene as the only arg', () => {
            executeGutTests('gut3.exe');

            expect(spawnSync).toHaveBeenCalledWith(
                'gut3.exe',
                ['res://test/test_scene.tscn'],
                {
                    cwd: '/path/to/project',
                    timeout: 30 * 1000,
                }
            );
        });

        describe('when godot version is greater than 3', () => {
            it('should execute the tests with --headless', () => {
                yargs.argv.godotVersion = '4.0.3';
                executeGutTests('gut4.exe');

                expect(spawnSync).toHaveBeenCalledWith(
                    'gut4.exe',
                    ['--headless', 'res://test/test_scene.tscn'],
                    {
                        cwd: '/path/to/project',
                        timeout: 30 * 1000,
                    }
                );
            });
        });
    });

    describe('when directScene is not given', () => {
        it('should execute the exe with gut args + CLI args', () => {
            yargs.argv = {
                ...yargs.argv,
                testDir: 'res://test_dir',
                testTimeout: 15,
                resultOutputFile: 'test_output.xml',
            }

            executeGutTests('gut3.exe');
            expect(spawnSync).toHaveBeenCalledWith(
                'gut3.exe',
                [
                    '-s', 'res://addons/gut/gut_cmdln.gd',
                    '-gdir=res://test_dir',
                    '-ginclude_subdirs',
                    `-gjunit_xml_file=./test_output.xml`,
                    `-gexit`,
                ],
                {
                    cwd: '/path/to/project',
                    timeout: 15 * 1000,
                }
            );
        });

        describe('when godot version is greater than 3', () => {
            it('should execute the tests with --headless', () => {
                yargs.argv = {
                    ...yargs.argv,
                    godotVersion: '4.0.3',
                    testDir: 'res://testing',
                    testTimeout: 45,
                    resultOutputFile: 'testing.xml',
                };

                executeGutTests('gut4.exe');
                expect(spawnSync).toHaveBeenCalledWith(
                    'gut4.exe',
                    [
                        '--headless',
                        '-s', 'res://addons/gut/gut_cmdln.gd',
                        '-gdir=res://testing',
                        '-ginclude_subdirs',
                        `-gjunit_xml_file=./testing.xml`,
                        `-gexit`,
                    ],
                    {
                        cwd: '/path/to/project',
                        timeout: 45 * 1000,
                    }
                );
            });
        });
    });

    describe('when configFile is not default', () => {
        it('should execute the exe with the -gconfig arg', () => {
            yargs.argv.configFile = 'res://test/.gutconfig.json';

            executeGutTests('gut3.exe');
            expect(spawnSync).toHaveBeenCalledWith(
                'gut3.exe',
                [
                    '-s', 'res://addons/gut/gut_cmdln.gd',
                    '-gdir=res://test',
                    '-ginclude_subdirs',
                    `-gjunit_xml_file=./test_results.xml`,
                    `-gexit`,
                    `-gconfig=res://test/.gutconfig.json`,
                ],
                {
                    cwd: '/path/to/project',
                    timeout: 30 * 1000,
                }
            );
        });
    });

    describe('timeout value', () => {
        it('should set the timeout value to spawnSync', () => {
            yargs.argv.testTimeout = 60;

            executeGutTests('gut3.exe');
            expect(spawnSync).toHaveBeenCalledWith(
                'gut3.exe',
                [
                    '-s', 'res://addons/gut/gut_cmdln.gd',
                    '-gdir=res://test',
                    '-ginclude_subdirs',
                    `-gjunit_xml_file=./test_results.xml`,
                    `-gexit`,
                ],
                {
                    cwd: '/path/to/project',
                    timeout: 60 * 1000,
                }
            );
        });
    });
});