const fs = require('fs');
const path = require('path');

function getTmpDir() {
    return path.join(process.cwd(), 'tmp');
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