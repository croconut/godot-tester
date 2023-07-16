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



describe('runGodotImport', () => {
    it('adds the importer scene to the godot project', () => {
        const childProcess = require('child_process');
        const {
            addRebuilderSceneToProjectAddonFolder,
            removeRebuilderSceneFromProjectAddonFolder,
        } = require('./helpers/ImportRebuilderHelpers/ImportRebuilderHelpers');
        jest.clearAllMocks();

        childProcess.spawnSync.mockReturnValue({
            error: null,
            status: 0,
            stdout: {
                toString: jest.fn(() => 'stdout'),
            },
        });
        const runGodotImport = require('./RunGodotImport');

        expect(addRebuilderSceneToProjectAddonFolder).toHaveBeenCalledTimes(0);
        expect(removeRebuilderSceneFromProjectAddonFolder).toHaveBeenCalledTimes(0);

        runGodotImport('exePath');

        expect(addRebuilderSceneToProjectAddonFolder).toHaveBeenCalledTimes(1);
        expect(removeRebuilderSceneFromProjectAddonFolder).toHaveBeenCalledTimes(1);
    });

    it('runs the godot executable with the importer scene', () => {
        process.env['INPUT_IMPORT-TIME'] = '30';

        const childProcess = require('child_process');
        jest.clearAllMocks();
        let consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        childProcess.spawnSync.mockReturnValue({
            error: null,
            status: 0,
            stdout: {
                toString: jest.fn(() => 'stdout'),
            },
        });
        const runGodotImport = require('./RunGodotImport');
        runGodotImport('exePath');

        expect(childProcess.spawnSync).toHaveBeenCalledTimes(1);
        expect(childProcess.spawnSync).toHaveBeenCalledWith(
            'exePath',
            [
                '--headless',
                '--editor',
                expect.toMatchPath('addons/gut/.cli_support/__rebuilder_scene.tscn'),
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