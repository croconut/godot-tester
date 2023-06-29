const fs = require('fs');
const path = require('path');

function getTmpDir() {
    if(!process.env.NODE_DIR) {
        throw new Error('NODE_DIR environment variable not set');
    }

    return path.join(process.env.NODE_DIR, 'tmp');
}

function deleteTmpDir() {
    const tmpDir = getTmpDir();
    if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir, { recursive: true });
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