const fs = require('fs');
const { createTmpDir, deleteTmpDir, getTmpDir } = require('./TmpDirHelpers');

describe('TmpDirHelpers', () => {
    let oldDirEnv;

    beforeEach(() => {
        oldDirEnv = process.env.THIS_ACTION_DIR;
        process.env.THIS_ACTION_DIR = '/home/user/project/subdir';
    });

    afterEach(() => {
        process.env.THIS_ACTION_DIR = oldDirEnv;
        jest.clearAllMocks();
    });

    describe('deleteTmpDir', () => {
        it('should delete the tmp directory in the cwd', () => {
            fs.existsSync.mockReturnValue(true);

            deleteTmpDir();

            expect(fs.existsSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp');
            expect(fs.rmSync).toHaveBeenCalledWith('/home/user/project/subdir/tmp', { recursive: true });
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

        it('should throw an error if the THIS_ACTION_DIR environment variable is not set', () => {
            process.env.THIS_ACTION_DIR = '';
            expect(() => getTmpDir()).toThrow('THIS_ACTION_DIR environment variable not set');
        });
    });
});