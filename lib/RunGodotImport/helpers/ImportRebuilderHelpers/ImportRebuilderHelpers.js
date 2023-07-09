const fs = require('fs');
const getProjectPath = require('../../../GetProjectPath/GetProjectPath');
const path = require('path');

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

module.exports = {
    addRebuilderSceneToProjectAddonFolder,
    removeRebuilderSceneFromProjectAddonFolder,
};