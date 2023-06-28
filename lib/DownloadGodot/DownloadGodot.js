const https = require('https');
const path = require('path');
const fs = require('fs');

const decompress = require('decompress');

const {
    createTmpDir,
    deleteTmpDir,
    getTmpDir
} = require('../TmpDirHelpers/TmpDirHelpers');
const performDownload = require('../PerformDownload/PerformDownload');
const generateGodotFilename = require('../GenerateGodotFilename/GenerateGodotFilename');
const getCliArgs = require('../GetCliArgs/GetCliArgs');

function generateDownloadUrl() {
    const {
        godotVersion,
        releaseType,
        isMono,
        customGodotDlUrl
    } = getCliArgs();

    if (customGodotDlUrl !== '') {
        return customGodotDlUrl;
    }

    let godotUrlPathSubdir = '';
    if (releaseType !== 'stable') {
        godotUrlPathSubdir = `/${releaseType}`;
    };

    let godotUrlPath = `${godotVersion}${godotUrlPathSubdir}/`;
    if (isMono) {
        godotUrlPath += 'mono/';
    }

    const { fullGodotNameWithArch } = generateGodotFilename();
    return `https://downloads.tuxfamily.org/godotengine/${godotUrlPath}${fullGodotNameWithArch}.zip`;
};

function findExecutablePath(unzippedFiles) {
    return unzippedFiles.find(file => {
        const isFile = file.type === 'file';
        if(!isFile) return false;

        const isExecutable = file.mode === 33261;
        if(!isExecutable) return false;

        // must end in .64 or .x86_64
        const isGodotExecutable = file.path.match(
            /^.*\.(x86_)?64$/
        )

        return isGodotExecutable;
    });
}

async function downloadGodot() {
    deleteTmpDir(); // wipe any existing tmp dir & contents
    createTmpDir();

    const { fullGodotNameWithArch } = generateGodotFilename();
    const fileDownloadPath = path.join(getTmpDir(), `${fullGodotNameWithArch}.zip`);
    
    const url = generateDownloadUrl();
    console.log('Downloading Godot from: ', url);    
    const godotZipPath = await performDownload(url, fileDownloadPath);

    console.log('Unzipping Godot...');
    const unzippedFiles = await decompress(godotZipPath, getTmpDir());
    const executablePath = findExecutablePath(unzippedFiles);

    if(!executablePath) {
        throw new Error('Could not find executable in downloaded Godot zip');
    };

    const executableFullPath = path.join(getTmpDir(), executablePath.path);
    return executableFullPath;
};

module.exports = downloadGodot;