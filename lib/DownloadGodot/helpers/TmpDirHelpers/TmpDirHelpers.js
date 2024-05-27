const fs = require('fs');
const path = require('path');

function getTmpDir() {
    if(!process.env.THIS_ACTION_DIR) {
        throw new Error('THIS_ACTION_DIR environment variable not set');
    }

    return path.join(process.env.THIS_ACTION_DIR, 'tmp');
}

function deleteTmpDir() {
    const tmpDir = getTmpDir();
    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true });
    }
};

function createTmpDir() {
    const tmpDir = getTmpDir();
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }
};

module.exports = {
    deleteTmpDir,
    createTmpDir,
    getTmpDir
};