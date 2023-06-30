const path = require('path');
const { spawnSync } = require('child_process');

const getProjectPath = require('../GetProjectPath/GetProjectPath');
const getCliArgs = require('../GetCliArgs/GetCliArgs');

const {
    addRebuilderSceneToProjectAddonFolder,
    removeRebuilderSceneFromProjectAddonFolder,
} = require('../ImportRebuilderHelpers/ImportRebuilderHelpers');

function runGodotImport(exePath) {
    addRebuilderSceneToProjectAddonFolder();

    console.log("Running Godot import...");
    const { importTime } = getCliArgs();
    const importProcResults = spawnSync(
        exePath,
        [
            '--headless',
            '--editor',
            path.join(
                'addons',
                'gut',
                '.cli_support',
                '__rebuilder_scene.tscn',
            ),
        ],
        {
            cwd: getProjectPath(),
            timeout: importTime * 1000,
        }
    );

    console.log('Godot Import results: ', importProcResults.stdout.toString());

    removeRebuilderSceneFromProjectAddonFolder();
};

module.exports = runGodotImport;