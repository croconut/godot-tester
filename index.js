#!/usr/bin/env node
/* eslint-disable camelcase */
/* eslint-disable no-console */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { parseString } from 'xml2js';
import {
  existsSync, mkdirSync, renameSync, readFileSync, rmSync,
} from 'fs';

const CUSTOM_DL_PATH = '~/custom_dl_folder';
const CUSTOM_CLI_PATH = './addons/gut/.cli_add';
const DL_URL = 'https://downloads.tuxfamily.org/godotengine/';

const yarged = yargs(hideBin(process.argv)).command('$0 [v] [type] [project_folder] [mono] [import_time] [test_time] [passrate] [test_folder] [direct_scene] [asserts] [fails] [ignore_error] [config_file]')
  .positional('v', { type: 'string', default: '3.2.2' })
  .positional('type', { type: 'string', default: 'stable' })
  .positional('project_folder', { type: 'string', default: './' })
  .positional('mono', { type: 'string', default: 'false' })
  .positional('import_time', { type: 'string', default: '1' })
  .positional('test_time', { type: 'string', default: '300' })
  .positional('passrate', { type: 'string', default: '0.99' })
  .positional('test_folder', { type: 'string', default: 'res://test' })
  .positional('direct_scene', { type: 'string', default: 'false' })
  .positional('asserts', { type: 'string', default: 'false' })
  .positional('fails', { type: 'string', default: 'false' })
  .positional('ignore_error', { type: 'string', default: 'false' })
  .positional('config_file', { type: 'string', default: 'res://.gutconfig.json' });

function make_dir({ path }) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function move_file({ oldPath, newPath }) {
  if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
  }
}

function remove_file({ path }) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

function create_godot_paths(argv) {
  const paths = {};
  paths.suffix = argv.type === 'stable' ? '' : `/${argv.type}`;

  if (!argv.mono || argv.mono === 'false') {
    paths.godot_release = argv.type;
    paths.dl_path_ext = `${argv.v}${paths.suffix}/`;
    paths.godot_name = `Godot_v${argv.v}-${paths.godot_release}_linux_headless.64`;
  } else {
    paths.godot_release = `${argv.type}_mono`;
    paths.dl_path_ext = `${argv.v}${paths.suffix}/mono/`;
    paths.godot_name = `Godot_v${argv.v}-${paths.godot_release}_linux_headless_64`;
  }
  paths.url = `${DL_URL}${paths.dl_path_ext}${paths.godot_name}.zip`;
  return paths;
}

async function download_godot({ v, type, mono }) {

}

async function check_tests({ file, argv }) {

}

async function check_asserts({ file, argv }) {

}

async function run_tests({ argv }) {
  process.chdir(`${process.cwd()}/${argv.project_folder}`);
  const run_options = !argv.direct_scene || argv.direct_scene === 'false'
    ? `-s addons/gut/gut_cmdln.gd -gdir=${argv.test_folder} -ginclude_subdirs -gexit -gconfig=${argv.config_file}`
    : argv.direct_scene;
  make_dir({ path: CUSTOM_DL_PATH });
  make_dir({ path: CUSTOM_CLI_PATH });
  move_file({ oldPath: '/__rebuilder.gd', newPath: CUSTOM_CLI_PATH });
  move_file({ oldPath: '/__rebuilder_scene.tscn', newPath: CUSTOM_CLI_PATH });
  const paths = create_godot_paths(argv);
  remove_file({ path: paths.godot_name });
  remove_file({ path: `${paths.godot_name}.zip` });
  console.log(paths);
  console.log(argv);
}

await run_tests(yarged);
