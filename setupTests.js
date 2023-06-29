jest.mock('yargs', () => {
    return {
        boolean: jest.fn().mockReturnThis(),
        number: jest.fn().mockReturnThis(),
        string: jest.fn().mockReturnThis(),
        argv: {
            godotVersion: '3.2.1',
            releaseType: 'stable',
            path: 'C:\\Users\\User\\Documents\\GitHub\\godot-ci\\test\\test-project',
            isMono: false,
            importTime: 10,
            testTimeout: 10,
            minimumPass: 1,
            testDir: 'test',
            directScene: '',
            assertCheck: false,
            maxFails: 0,
            configFile: '',
            customGodotDlUrl: '',
            resultOutputFile: ''
        }
    }
});

jest.mock('fs');
jest.mock('https');

process.env.THIS_ACTION_DIR = __dirname;