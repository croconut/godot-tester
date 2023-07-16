const core = require('@actions/core');

let input = null;

function getCliArgs() {
    if (input === null) {
        input = {
            godotVersion: core.getInput('version'),
            releaseType: core.getInput('release_type'),
            path: core.getInput('path'),
            isMono: core.getInput('is-mono'),
            importTime: core.getInput('import-time'),
            testTimeout: core.getInput('test-timeout'),
            minimumPass: core.getInput('minimum-pass'),
            testDir: core.getInput('test-dir'),
            directScene: core.getInput('direct-scene'),
            assertCheck: core.getInput('assert-check'),
            maxFails: core.getInput('max-fails'),
            configFile: core.getInput('config-file'),
            customGodotDlUrl: core.getInput('custom-godot-dl-url'),
            resultOutputFile: core.getInput('result-output-file'),
          };
    }
    return { ...input };
};

module.exports = getCliArgs;
