import { join } from 'path'
import * as fs from 'fs'
import { spawnSync } from 'child_process'

import { type ActionInput } from './GetCliArgs.js'

function addRebuilderSceneToProjectAddonFolder (input: Readonly<ActionInput>): void {
  const { thisActionDir, projectPath } = input

  const items = [
    '__rebuilder_scene.tscn',
    '__rebuilder.gd'
  ]

  // create the folder if it doesn't exist
  const folderPath = join(
    projectPath,
    'addons',
    'gut',
    '.cli_support'
  )

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  };

  items.forEach((item) => {
    const oldItemPath = join(
      thisActionDir,
      'assets',
      item
    )
    const newItemPath = join(
      folderPath,
      item
    )

    fs.copyFileSync(oldItemPath, newItemPath)
  })
};

function removeRebuilderSceneFromProjectAddonFolder (input: Readonly<ActionInput>): void {
  const { projectPath } = input
  const items = [
    '__rebuilder_scene.tscn',
    '__rebuilder.gd'
  ]

  items.forEach((item) => {
    const itemPath = join(
      projectPath,
      'addons',
      'gut',
      '.cli_support',
      item
    )

    fs.unlinkSync(itemPath)
  })
};

function runGodotImport (input: Readonly<ActionInput>, exePath: string): void {
  const { importTime, projectPath } = input
  addRebuilderSceneToProjectAddonFolder(input)

  console.log('Running Godot import...')
  const importProcResults = spawnSync(
    exePath,
    [
      '--headless',
      '--editor',
      join(
        'addons',
        'gut',
        '.cli_support',
        '__rebuilder_scene.tscn'
      )
    ],
    {
      cwd: projectPath,
      timeout: importTime * 1000
    }
  )

  console.log('Godot Import results: ', importProcResults.stdout.toString())

  removeRebuilderSceneFromProjectAddonFolder(input)
};

export default runGodotImport
