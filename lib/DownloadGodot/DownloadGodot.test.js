jest.mock('decompress');
jest.mock('../TmpDirHelpers/TmpDirHelpers', () => {
    return {
        getTmpDir: jest.fn(),
        createTmpDir: jest.fn(),
        deleteTmpDir: jest.fn(),
    }
});
jest.mock('../GenerateGodotFilename/GenerateGodotFilename');
jest.mock('../PerformDownload/PerformDownload');

const yargs = require('yargs');
const decompress = require('decompress');

const generateGodotFilename = require('../GenerateGodotFilename/GenerateGodotFilename');
const { getTmpDir } = require('../TmpDirHelpers/TmpDirHelpers');
const performDownload = require('../PerformDownload/PerformDownload');
const downloadGodot = require('./DownloadGodot');

describe('downloadGodot', () => {
    const fakeTempDir = '/home/user/project/subdir/tmp';

    beforeEach(() => {
        let consoleLogSpy = jest.spyOn(console, 'log');
        consoleLogSpy.mockImplementation(() => { }); // silence console.log

        generateGodotFilename.mockReturnValue({ fullGodotNameWithArch: 'godot-file.64' });
        decompress.mockResolvedValue([{ type: 'file', mode: 33261, path: 'godot-file.64' }]);
        getTmpDir.mockReturnValue(fakeTempDir);
        performDownload.mockResolvedValue(`${fakeTempDir}/godot-file.64.zip`);
        yargs.argv.releaseType = 'stable';
        yargs.argv.godotVersion = '3.2.3';
        yargs.argv.isMono = false;
        yargs.argv.customGodotDlUrl = '';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('given custom godot download url', () => {
        beforeEach(() => {
            yargs.argv.customGodotDlUrl = 'https://custom.url';
        });

        it('should download the file from the custom url', async () => {
            let expectedFileDownloadPath = `${fakeTempDir}/godot-file.64.zip`;
            performDownload.mockResolvedValue(expectedFileDownloadPath);

            await downloadGodot();
            expect(performDownload).toHaveBeenCalledWith('https://custom.url', expectedFileDownloadPath);
            expect(decompress).toHaveBeenCalledWith(expectedFileDownloadPath, fakeTempDir);
        });
    });

    describe('given mono is false', () => {
        describe('given release type is stable', () => {
            it('should download the file without a release type subdir', async () => {
                generateGodotFilename.mockReturnValue({ fullGodotNameWithArch: 'godot-file-name' });
                let expectedFileDownloadPath = `${fakeTempDir}/godot-file-name.zip`;
                performDownload.mockResolvedValue(expectedFileDownloadPath);

                await downloadGodot();
                expect(performDownload).toHaveBeenCalledWith(
                    'https://downloads.tuxfamily.org/godotengine/3.2.3/godot-file-name.zip',
                    expectedFileDownloadPath
                );
                expect(decompress).toHaveBeenCalledWith(expectedFileDownloadPath, fakeTempDir);
            });
        })

        describe('given release type is not stable', () => {
            it('should download the file with a release type subdir', async () => {
                yargs.argv.releaseType = 'beta';
                yargs.argv.godotVersion = '3.5.3'; // used for subpath
                generateGodotFilename.mockReturnValue({ fullGodotNameWithArch: 'different-file-name' });
                let expectedFileDownloadPath = `${fakeTempDir}/different-file-name.zip`;
                performDownload.mockResolvedValue(expectedFileDownloadPath);

                await downloadGodot();
                expect(performDownload).toHaveBeenCalledWith(
                    'https://downloads.tuxfamily.org/godotengine/3.5.3/beta/different-file-name.zip',
                    expectedFileDownloadPath
                );
                expect(decompress).toHaveBeenCalledWith(expectedFileDownloadPath, fakeTempDir);
            });
        });
    });

    describe('given mono is true', () => {
        beforeEach(() => {
            yargs.argv.isMono = true;
        });

        describe('given release type is stable', () => {
            it('should download the file without a release type subdir', async () => {
                generateGodotFilename.mockReturnValue({ fullGodotNameWithArch: 'mono-godot-file-name' });
                let expectedFileDownloadPath = `${fakeTempDir}/mono-godot-file-name.zip`;
                performDownload.mockResolvedValue(expectedFileDownloadPath);

                await downloadGodot();
                expect(performDownload).toHaveBeenCalledWith(
                    'https://downloads.tuxfamily.org/godotengine/3.2.3/mono/mono-godot-file-name.zip',
                    expectedFileDownloadPath
                );
                expect(decompress).toHaveBeenCalledWith(expectedFileDownloadPath, fakeTempDir);
            });
        });

        describe('given release type is not stable', () => {
            it('should download the file with a release type subdir', async () => {
                yargs.argv.releaseType = 'beta';
                yargs.argv.godotVersion = '3.5.3'; // used for subpath
                generateGodotFilename.mockReturnValue({ fullGodotNameWithArch: 'mono-different-file-name' });
                let expectedFileDownloadPath = `${fakeTempDir}/mono-different-file-name.zip`;
                performDownload.mockResolvedValue(expectedFileDownloadPath);

                await downloadGodot();
                expect(performDownload).toHaveBeenCalledWith(
                    'https://downloads.tuxfamily.org/godotengine/3.5.3/beta/mono/mono-different-file-name.zip',
                    expectedFileDownloadPath
                );
                expect(decompress).toHaveBeenCalledWith(expectedFileDownloadPath, fakeTempDir);
            });
        });
    });

    it('should return the executable path', async () => {
        const executablePath = await downloadGodot();
        expect(executablePath).toEqual(`${fakeTempDir}/godot-file.64`);
    });

    it('should throw an error when no executable is found', () => {
        decompress.mockResolvedValue([{ type: 'file', mode: 33261, path: 'godot-file-missing-arch-sig.420' }]);
        expect(downloadGodot()).rejects.toThrow('Could not find executable in downloaded Godot zip');
    });
});
