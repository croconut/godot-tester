import { get } from 'https'
import { join } from 'path'
import { existsSync, rmdirSync, mkdirSync, createWriteStream, unlink } from 'fs'
import decompress from 'decompress'
import { type ActionInput } from './GetCliArgs.js'

interface GodotFilenames {
  fullGodotName: string
  fullGodotNameWithArch: string
}

function getTmpDir (input: Readonly<ActionInput>): string {
  return join(input.thisActionDir, 'tmp')
}

function deleteTmpDir (input: Readonly<ActionInput>): void {
  const tmpDir = getTmpDir(input)
  if (existsSync(tmpDir)) {
    rmdirSync(tmpDir, { recursive: true })
  }
};

function createTmpDir (input: Readonly<ActionInput>): void {
  const tmpDir = getTmpDir(input)
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir)
  }
};

async function performDownload (url: URL, fileLocation: string): Promise<string> {
  const downloadedFile = createWriteStream(fileLocation)

  return await new Promise((resolve, reject) => {
    get(url, (response) => {
      response.pipe(downloadedFile)
      downloadedFile.on('finish', () => {
        downloadedFile.close()
        resolve(fileLocation)
      })
    }).on('error', (error: Error) => {
      unlink(fileLocation, (err: Error | null) => {
        if (err != null) {
          console.error('file removal failed', err.message)
        }
      })
      reject(error)
    })
  })
}

function generateGodotFilename (input: Readonly<ActionInput>): GodotFilenames {
  const { godotVersion, godotFourPlus, releaseType, isMono } = input
  let fullGodotName = `Godot_v${godotVersion}-${releaseType}`
  let fullGodotNameWithArch = ''
  if (godotFourPlus) {
    if (isMono) {
      fullGodotName += '_mono_linux'
      fullGodotNameWithArch = `${fullGodotName}_x86_64`
    } else {
      fullGodotName += '_linux'
      fullGodotNameWithArch = `${fullGodotName}.x86_64`
    }
  } else {
    if (isMono) {
      fullGodotName += '_mono_linux_headless'
      fullGodotNameWithArch = `${fullGodotName}_64`
    } else {
      fullGodotName += '_linux_headless'
      fullGodotNameWithArch = `${fullGodotName}.64`
    }
  }

  return {
    fullGodotName,
    fullGodotNameWithArch
  }
};

function generateDownloadUrl (input: Readonly<ActionInput>): URL {
  const {
    godotVersion,
    releaseType,
    isMono,
    customGodotDlUrl
  } = input

  if (customGodotDlUrl != null) {
    return customGodotDlUrl
  }

  let godotUrlPathSubdir = ''
  if (releaseType !== 'stable') {
    godotUrlPathSubdir = `/${releaseType}`
  };

  let godotUrlPath = `${godotVersion}${godotUrlPathSubdir}/`
  if (isMono) {
    godotUrlPath += 'mono/'
  }

  const { fullGodotNameWithArch } = generateGodotFilename(input)
  return new URL(`https://downloads.tuxfamily.org/godotengine/${godotUrlPath}${fullGodotNameWithArch}.zip`)
};

function findExecutablePath (unzippedFiles: decompress.File[]): decompress.File | undefined {
  return unzippedFiles.find((file) => {
    const isFile = file.type === 'file'
    if (!isFile) return false

    const isExecutable = file.mode === 33261
    if (!isExecutable) return false

    // must end in .64 or .x86_64
    return file.path.match(
      /^.*\.(x86_)?64$/
    )
  })
}

async function downloadGodot (input: Readonly<ActionInput>): Promise<string> {
  deleteTmpDir(input) // wipe any existing tmp dir & contents
  createTmpDir(input)

  const { fullGodotNameWithArch } = generateGodotFilename(input)
  const fileDownloadPath = join(getTmpDir(input), `${fullGodotNameWithArch}.zip`)

  const url = generateDownloadUrl(input)
  console.log('Downloading Godot from: ', url)
  const godotZipPath = await performDownload(url, fileDownloadPath)

  console.log('Unzipping Godot...')
  const unzippedFiles = await decompress(godotZipPath, getTmpDir(input))
  const executablePath = findExecutablePath(unzippedFiles)

  if (executablePath === undefined) {
    throw new Error('Could not find executable in downloaded Godot zip')
  };

  const executableFullPath = join(getTmpDir(input), executablePath.path)

  console.log('Godot unzipped to: ', executableFullPath)
  return executableFullPath
};

export default downloadGodot
