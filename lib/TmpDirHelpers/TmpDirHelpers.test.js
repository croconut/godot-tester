const fs = require('fs');
const { createTmpDir, deleteTmpDir, getTmpDir } = require('./TmpDirHelpers');

describe('TmpDirHelpers', () => {
    let oldDirEnv;

    beforeEach(() => {
        oldDirEnv = process.env.NODE_DIR;
        process.env.NODE_DIR = '/home/user/project/subdir';
    });

    afterEach(() => {
        process.env.NODE_DIR = oldDirEnv;
        jest.clearAllMocks();
    });

    describe('deleteTmpDir', () => {
        it('should delete the tmp directory in the cwd', () => {
            fs.existsSync.mockReturnValue(true);

            deleteTmpDir();

            expect(fs.existsSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp');
            expect(fs.rmdirSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp', { recursive: true });
        });
    });

    describe('createTmpDir', () => {
        it('should create the tmp directory in the cwd', () => {
            fs.existsSync.mockReturnValue(false);

            createTmpDir();

            expect(fs.existsSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp');
            expect(fs.mkdirSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp');
        });
    });

    describe('getTmpDir', () => {
        it('should return the tmp directory in the cwd', () => {
            expect(getTmpDir()).toEqual('/home/user/project/subdir/tmp');
        });

        it('should throw an error if the NODE_DIR environment variable is not set', () => {
            process.env.NODE_DIR = '';
            expect(() => getTmpDir()).toThrow('NODE_DIR environment variable not set');
        });
    });
});