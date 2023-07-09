const yargs = require('yargs');
const getProjectPath = require('./GetProjectPath');

describe('getProjectPath', () => {
    let oldWorkspaceEnv;

    beforeEach(() => {
        oldWorkspaceEnv = process.env.GITHUB_WORKSPACE;
        process.env.GITHUB_WORKSPACE = '/home/runner/work/MyProject/MyProject';

        yargs.argv = {
            ...yargs.argv,
            path: './',
        };
    });

    afterEach(() => {
        process.env.GITHUB_WORKSPACE = oldWorkspaceEnv;
    });

    describe('given a project path', () => {
        it('should join the GITHUB_WORKSPACE & project path', () => {
            yargs.argv.path = 'SubDir';
            const projectPath = getProjectPath();
            expect(projectPath).toBe('/home/runner/work/MyProject/MyProject/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            yargs.argv.path = 'SubDir/SubDir';
            const projectPath = getProjectPath();
            expect(projectPath).toBe('/home/runner/work/MyProject/MyProject/SubDir/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            yargs.argv.path = './SubDir';
            const projectPath = getProjectPath();
            expect(projectPath).toBe('/home/runner/work/MyProject/MyProject/SubDir');
        });

        it('should join the GITHUB_WORKSPACE & project path', () => {
            yargs.argv.path = './SubDir/SubDir/';
            const projectPath = getProjectPath();
            expect(projectPath).toBe('/home/runner/work/MyProject/MyProject/SubDir/SubDir/');
        });
    });

    describe('given no project path', () => {
        it('should return the GITHUB_WORKSPACE', () => {
            const projectPath = getProjectPath();
            expect(projectPath).toBe('/home/runner/work/MyProject/MyProject/');
        });
    });

    describe('given no GITHUB_WORKSPACE', () => {
        it('should throw an error', () => {
            delete process.env.GITHUB_WORKSPACE;
            expect(() => getProjectPath()).toThrow('GITHUB_WORKSPACE environment variable not set');
        });
    });
});