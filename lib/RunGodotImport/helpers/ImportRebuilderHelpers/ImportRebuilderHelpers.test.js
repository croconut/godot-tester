jest.mock('../../../GetProjectPath/GetProjectPath', () => (
    jest.fn().mockReturnValue('/home/runner/TargetProject/')
));

const fs = require('fs');

const {
    addRebuilderSceneToProjectAddonFolder,
    removeRebuilderSceneFromProjectAddonFolder,
} = require('./ImportRebuilderHelpers');

describe('ImportRebuilderHelpers', () => {
    let oldNodeDirEnv;
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks(); 
        oldNodeDirEnv = process.env.THIS_ACTION_DIR;

        process.env.THIS_ACTION_DIR = '/home/runner/ThisRepository';

        fs.readdirSync.mockReturnValue([]);
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env.THIS_ACTION_DIR = oldNodeDirEnv;
    });
    
    describe('addRebuilderSceneToProjectAddonFolder', () => {
        describe('given the folder does not exist', () => {
            beforeEach(() => {
                fs.existsSync.mockReturnValue(false);
            });

            it('creates the folder', () => {
                addRebuilderSceneToProjectAddonFolder();

                expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
                expect(fs.mkdirSync).toHaveBeenCalledWith(
                    '/home/runner/TargetProject/addons/gut/.cli_support',
                );
            });
        });

        describe('given the folder exists', () => {
            beforeEach(() => {
                fs.existsSync.mockReturnValue(true);
            });

            it('does not create the folder', () => {
                addRebuilderSceneToProjectAddonFolder();

                expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
            });
        });

        it('copies the scene from THIS_ACTION_DIR to the project path', () => {
            addRebuilderSceneToProjectAddonFolder();

            expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
            expect(fs.copyFileSync).toHaveBeenCalledWith(
                '/home/runner/ThisRepository/assets/__rebuilder_scene.tscn',
                '/home/runner/TargetProject/addons/gut/.cli_support/__rebuilder_scene.tscn',
            );
        });

        it('copies the script from the THIS_ACTION_DIR to the project path', () => {
            addRebuilderSceneToProjectAddonFolder();

            expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
            expect(fs.copyFileSync).toHaveBeenCalledWith(
                '/home/runner/ThisRepository/assets/__rebuilder.gd',
                '/home/runner/TargetProject/addons/gut/.cli_support/__rebuilder.gd',
            );
        });

        it('throws an error if THIS_ACTION_DIR is not set', () => {
            delete process.env.THIS_ACTION_DIR

            expect(() => {
                addRebuilderSceneToProjectAddonFolder();
            }).toThrow('THIS_ACTION_DIR environment variable not set');
        });
    });

    describe('removeRebuilderSceneFromProjectAddonFolder', () => {
        it('removes the scene from the project path', () => {
            removeRebuilderSceneFromProjectAddonFolder();

            expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
            expect(fs.unlinkSync).toHaveBeenCalledWith(
                '/home/runner/TargetProject/addons/gut/.cli_support/__rebuilder_scene.tscn',
            );
        });

        it('removes the script from the project path', () => {
            removeRebuilderSceneFromProjectAddonFolder();

            expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
            expect(fs.unlinkSync).toHaveBeenCalledWith(
                '/home/runner/TargetProject/addons/gut/.cli_support/__rebuilder.gd',
            );
        });

        it('throws an error if THIS_ACTION_DIR is not set', () => {
            delete process.env.THIS_ACTION_DIR

            expect(() => {
                removeRebuilderSceneFromProjectAddonFolder();
            }).toThrow('THIS_ACTION_DIR environment variable not set');
        });
    });
});