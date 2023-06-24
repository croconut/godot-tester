#!/usr/bin/env node
const argv = require('yargs')
    .boolean(['isMono', 'assertCheck'])
    .number(['importTime', 'testTimeout', 'minimumPass', 'maxFails'])
    .string([
        'godotVersion',
        'releaseType',
        'path',
        'testDir',
        'directScene',
        'configFile',
        'customGodotDlUrl',
        'resultOutputFile'
    ])
    .argv;

const inputs = {
    godotVersion: argv.godotVersion,
    releaseType: argv.releaseType,
    path: argv.path,
    isMono: argv.isMono,
    importTime: argv.importTime,
    testTimeout: argv.testTimeout,
    minimumPass: argv.minimumPass,
    testDir: argv.testDir,
    directScene: argv.directScene,
    assertCheck: argv.assertCheck,
    maxFails: argv.maxFails,
    configFile: argv.configFile,
    customGodotDlUrl: argv.customGodotDlUrl,
    resultOutputFile: argv.resultOutputFile
};

console.log('Inputs: ', inputs);