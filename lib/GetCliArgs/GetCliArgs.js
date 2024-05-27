function getCliArgs() {
    return require('yargs')
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
            'customGodotBinaryPath',
            'resultOutputFile'
        ])
        .argv;
};

module.exports = getCliArgs;