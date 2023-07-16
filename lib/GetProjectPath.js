const pathLib = require('path');
const getCliArgs = require('./GetCliArgs');

function getProjectPath() {
    if (!process.env.GITHUB_WORKSPACE) {
        throw new Error('GITHUB_WORKSPACE environment variable not set');
    };

    const { path } = getCliArgs();
    const projectPath = pathLib.join(process.env.GITHUB_WORKSPACE, path);
    return projectPath;
};

module.exports = getProjectPath;