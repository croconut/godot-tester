const getProjectPath = require('../GetProjectPath/GetProjectPath');
const getCliArgs = require('../GetCliArgs/GetCliArgs');
const isGodotFour = require('../IsGodotFour/IsGodotFour');
const { spawnSync } = require('child_process');

function executeGutTests(exePath) {
    const cliArgs = getCliArgs();
    let args = [];

    if(isGodotFour()) {
        args.push('--headless');
    };

    if(cliArgs.directScene !== 'false') {
        args.push(cliArgs.directScene);
    } else {
        args = args.concat([
            '-s', 'res://addons/gut/gut_cmdln.gd',
            `-gdir=${cliArgs.testDir}`,
            '-ginclude_subdirs',
            `-gjunit_xml_file=./${cliArgs.resultOutputFile}`,
            `-gexit`,
        ]);

        if(cliArgs.configFile !== 'res://.gutconfig.json') {
            args.push(`-gconfig=${cliArgs.configFile}`);
        }
    };

    const results = spawnSync(
        exePath,
        args,
        {
            cwd: getProjectPath(),
            timeout: cliArgs.testTimeout * 1000,
        }
    );

    console.log('GUT test results: ', results.stdout.toString());
};

module.exports = executeGutTests;