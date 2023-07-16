let getProjectPath;

describe('getProjectPath', () => {
    let oldWorkspaceEnv;

    beforeEach(() => {
        oldWorkspaceEnv = process.env.GITHUB_WORKSPACE;
        process.env.GITHUB_WORKSPACE = '/home/runner/work/MyProject/MyProject';
        process.env['INPUT_PATH'] = './';
        getProjectPath = require('../GetProjectPath');
    });

    afterEach(() => {
        process.env.GITHUB_WORKSPACE = oldWorkspaceEnv;
    });

    describe('given a project path', () => {
        it('should join the GITHUB_WORKSPACE & project path', () => {
            process.env['INPUT_PATH'] = 'SubDir';
            getProjectPath = require('../GetProjectPath');
            const projectPath = getProjectPath();
            expect(projectPath).toMatchPath('/home/runner/work/MyProject/MyProject/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            process.env['INPUT_PATH'] = 'SubDir/SubDir';
            getProjectPath = require('../GetProjectPath');
            const projectPath = getProjectPath();
            expect(projectPath).toMatchPath('/home/runner/work/MyProject/MyProject/SubDir/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            process.env['INPUT_PATH'] = './SubDir';
            getProjectPath = require('../GetProjectPath');
            const projectPath = getProjectPath();
            expect(projectPath).toMatchPath('/home/runner/work/MyProject/MyProject/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            process.env['INPUT_PATH'] = './SubDir/SubDir/';
            getProjectPath = require('../GetProjectPath');
            const projectPath = getProjectPath();
            expect(projectPath).toMatchPath('/home/runner/work/MyProject/MyProject/SubDir/SubDir/');
        });
    });

    describe('given no project path', () => {
        it('should return the GITHUB_WORKSPACE', () => {
            const projectPath = getProjectPath();
            expect(projectPath).toMatchPath('/home/runner/work/MyProject/MyProject/');
        });
    });

    describe('given no GITHUB_WORKSPACE', () => {
        it('should throw an error', () => {
            delete process.env.GITHUB_WORKSPACE;
            expect(() => getProjectPath()).toThrow('GITHUB_WORKSPACE environment variable not set');
        });
    });
});