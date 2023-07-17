import { spawnSync } from 'child_process'
import { type ActionInput } from './GetCliArgs.js'

function executeGutTests (input: Readonly<ActionInput>, exePath: string): void {
  const { directScene, projectPath, godotFourPlus, testDir, resultOutputFile, configFile, testTimeout } = input
  let args: string[] = []

  if (godotFourPlus) {
    args.push('--headless')
  };

  if (directScene !== undefined && directScene !== '') {
    args.push(directScene)
  } else {
    args = args.concat([
      '-s', 'res://addons/gut/gut_cmdln.gd',
      `-gdir=${testDir}`,
      '-ginclude_subdirs',
      `-gjunit_xml_file=./${resultOutputFile}`,
      '-gexit'
    ])

    if (configFile !== 'res://.gutconfig.json') {
      args.push(`-gconfig=${configFile}`)
    }
  };

  console.log('Running GUT tests...')
  const results = spawnSync(
    exePath,
    args,
    {
      cwd: projectPath,
      timeout: testTimeout * 1000
    }
  )

  console.log('GUT test results: ', results.stdout.toString())
};

export default executeGutTests
