jest.mock('child_process', () => ({
    spawnSync: jest.fn().mockReturnValue({
        error: null,
        status: 0,
    }),
}));

jest.mock('./helpers/ImportRebuilderHelpers/ImportRebuilderHelpers', () => ({
    addRebuilderSceneToProjectAddonFolder: jest.fn(),
    removeRebuilderSceneFromProjectAddonFolder: jest.fn(),
}));

jest.mock('../GetProjectPath/GetProjectPath', () => (
    jest.fn().mockReturnValue('projectPath')
));

const childProcess = require('child_process');
const {
    addRebuilderSceneToProjectAddonFolder,
    removeRebuilderSceneFromProjectAddonFolder,
} = require('./helpers/ImportRebuilderHelpers/ImportRebuilderHelpers');
const runGodotImport = require('./RunGodotImport');
const yargs = require('yargs');
describe('runGodotImport', () => {
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        childProcess.spawnSync.mockReturnValue({
            error: null,
            status: 0,
            stdout: {
                toString: jest.fn(() => 'stdout'),
            },
        })
    })
    
    it('adds the importer scene to the godot project', () => {
        expect(addRebuilderSceneToProjectAddonFolder).toHaveBeenCalledTimes(0);
        expect(removeRebuilderSceneFromProjectAddonFolder).toHaveBeenCalledTimes(0);

        runGodotImport('exePath');

        expect(addRebuilderSceneToProjectAddonFolder).toHaveBeenCalledTimes(1);
        expect(removeRebuilderSceneFromProjectAddonFolder).toHaveBeenCalledTimes(1);
    });

    it('runs the godot executable with the importer scene', () => {
        yargs.argv.importTime = 30;
        runGodotImport('exePath');

        expect(childProcess.spawnSync).toHaveBeenCalledTimes(1);
        expect(childProcess.spawnSync).toHaveBeenCalledWith(
            'exePath',
            [
                '--headless',
                '--editor',
                'addons/gut/.cli_support/__rebuilder_scene.tscn',
            ],
            {
                cwd: 'projectPath',
                timeout: 30 * 1000,
            }
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            'Godot Import results: ',
            'stdout',
        );
    });
});