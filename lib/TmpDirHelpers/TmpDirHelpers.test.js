const fs = require('fs');
const { createTmpDir, deleteTmpDir, getTmpDir } = require('./TmpDirHelpers');

describe('TmpDirHelpers', () => {
    let cwdSpy;

    beforeEach(() => {
        cwdSpy = jest.spyOn(process, 'cwd');
        cwdSpy.mockReturnValue('/home/user/project/subdir');
    });

    afterEach(() => {
        cwdSpy.mockRestore();
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
    });
});