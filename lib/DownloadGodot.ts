import {get} from 'https';
import {join} from 'path';
import {existsSync, rmdirSync, mkdirSync, createWriteStream, unlink} from 'fs';
import decompress from 'decompress';
import { ActionInput } from './GetCliArgs.js';

function getTmpDir(input: Readonly<ActionInput>) {
  return join(input.thisActionDir, 'tmp');
}

function deleteTmpDir(input: Readonly<ActionInput>) {
  const tmpDir = getTmpDir(input);
  if (existsSync(tmpDir)) {
    rmdirSync(tmpDir, {recursive: true});
  }
};

function createTmpDir(input: Readonly<ActionInput>) {
  const tmpDir = getTmpDir(input);
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir);
  }
};

function performDownload(url: URL, fileLocation: string): Promise<string> {
  const downloadedFile = createWriteStream(fileLocation);

  return new Promise((resolve, reject) => {
    get(url, (response) => {
      response.pipe(downloadedFile);
      downloadedFile.on('finish', () => {
        downloadedFile.close();
        return resolve(fileLocation);
      });
    }).on('error', (error: Error) => {
      unlink(fileLocation, (err: Error | null) => { 
        if (err) { 
          console.error('file removal failed', err.message);
        } 
      });
      return reject(error);
    });
  });
}

function generateGodotFilename(input: Readonly<ActionInput>) {
  const { godotVersion, godotFourPlus, releaseType, isMono } = input;
  let fullGodotName = `Godot_v${godotVersion}-${releaseType}`;
  let fullGodotNameWithArch = '';
  if (godotFourPlus) {
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
    fullGodotNameWithArch,
  };
};


function generateDownloadUrl(input: Readonly<ActionInput>): URL {
  const {
    godotVersion,
    releaseType,
    isMono,
    customGodotDlUrl,
  } = input;

  if (customGodotDlUrl) {
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

  const {fullGodotNameWithArch} = generateGodotFilename(input);
  return new URL(`https://downloads.tuxfamily.org/godotengine/${godotUrlPath}${fullGodotNameWithArch}.zip`);
};

function findExecutablePath(unzippedFiles: decompress.File[]) {
  return unzippedFiles.find((file) => {
    const isFile = file.type === 'file';
    if (!isFile) return false;

    const isExecutable = file.mode === 33261;
    if (!isExecutable) return false;

    // must end in .64 or .x86_64
    return file.path.match(
        /^.*\.(x86_)?64$/,
    );
  });
}

async function downloadGodot(input: Readonly<ActionInput>) {
  deleteTmpDir(input); // wipe any existing tmp dir & contents
  createTmpDir(input);

  const {fullGodotNameWithArch} = generateGodotFilename(input);
  const fileDownloadPath = join(getTmpDir(input), `${fullGodotNameWithArch}.zip`);

  const url = generateDownloadUrl(input);
  console.log('Downloading Godot from: ', url);
  const godotZipPath = await performDownload(url, fileDownloadPath);

  console.log('Unzipping Godot...');
  const unzippedFiles = await decompress(godotZipPath, getTmpDir(input));
  const executablePath = findExecutablePath(unzippedFiles);

  if (!executablePath) {
    throw new Error('Could not find executable in downloaded Godot zip');
  };

  const executableFullPath = join(getTmpDir(input), executablePath.path);

  console.log('Godot unzipped to: ', executableFullPath);
  return executableFullPath;
};

export default downloadGodot;
