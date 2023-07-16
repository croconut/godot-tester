const path = require('path');
const { spawnSync } = require('child_process');

const getProjectPath = require('./GetProjectPath');
const getCliArgs = require('./GetCliArgs');

function addRebuilderSceneToProjectAddonFolder() {
    if(!process.env.THIS_ACTION_DIR) {
        throw new Error('THIS_ACTION_DIR environment variable not set');
    };

    const items = [
        '__rebuilder_scene.tscn',
        '__rebuilder.gd',
    ];

    // create the folder if it doesn't exist
    const folderPath = path.join(
        getProjectPath(),
        'addons',
        'gut',
        '.cli_support',
    );

    if(!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    };

    items.forEach((item) => {
        const oldItemPath = path.join(
            process.env.THIS_ACTION_DIR,
            'assets',
            item,
        );
        const newItemPath = path.join(
            folderPath,
            item,
        );

        fs.copyFileSync(oldItemPath, newItemPath);
    });
};

function removeRebuilderSceneFromProjectAddonFolder() {
    if(!process.env.THIS_ACTION_DIR) {
        throw new Error('THIS_ACTION_DIR environment variable not set');
    };

    const items = [
        '__rebuilder_scene.tscn',
        '__rebuilder.gd',
    ];

    items.forEach((item) => {
        const itemPath = path.join(
            getProjectPath(),
            'addons',
            'gut',
            '.cli_support',
            item,
        );

        fs.unlinkSync(itemPath);
    });
};

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