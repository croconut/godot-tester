const https = require('https');
const path = require('path');
const fs = require('fs');
const decompress = require('decompress');
const getCliArgs = require('../GetCliArgs/GetCliArgs');

function getTmpDir() {
    if(!process.env.THIS_ACTION_DIR) {
        throw new Error('THIS_ACTION_DIR environment variable not set');
    }

    return path.join(process.env.THIS_ACTION_DIR, 'tmp');
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

function performDownload(url, fileLocation) {
    const downloadedFile = fs.createWriteStream(fileLocation);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.pipe(downloadedFile);
            downloadedFile.on('finish', () => {
                downloadedFile.close();
                resolve(fileLocation);
            });
        }).on('error', error => {
            fs.unlink(fileLocation);
            reject(error);
        });
    });
}

function generateGodotFilename() {
    const args = getCliArgs();

    const godotVersion = args.godotVersion;
    const releaseType = args.releaseType;
    const isMono = args.isMono;

    let fullGodotName = `Godot_v${godotVersion}-${releaseType}`;
    let fullGodotNameWithArch = '';
    if (isGodotFour()) {
        if (isMono) {
            fullGodotName += '_mono_linux';
            fullGodotNameWithArch = `${fullGodotName}_x86_64`;
        } else {
            fullGodotName += '_linux';
            fullGodotNameWithArch = `${fullGodotName}.x86_64`;
        }
    } else {
        if (isMono) {
            fullGodotName += '_mono_linux_headless';
            fullGodotNameWithArch = `${fullGodotName}_64`;
        } else {
            fullGodotName += '_linux_headless';
            fullGodotNameWithArch = `${fullGodotName}.64`;
        }
    }

    return {
        fullGodotName,
        fullGodotNameWithArch
    };
};


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

    console.log('Godot unzipped to: ', executableFullPath);
    return executableFullPath;
};

module.exports = downloadGodot;