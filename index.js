/// for maintainers: 
/// this file must be compiled to run on github actions - 
/// ./node_modules/.bin/ncc build index.js --license LICENSE
/// this should be done after any JS changes are made as part of the PR

/// additionally it is recommended to have the correct version of node
/// installed, see the action.yml file for that
///

const core = require('@actions/core');
const { rmdirSync, unlinkSync, existsSync, mkdirSync, createWriteStream, writeFileSync, renameSync } = require('node:fs');
const { Readable } = require('node:stream');
const { finished } = require('node:stream/promises');
const { homedir } = require('node:os');
const extract = require('extract-zip');
const fetch = require('cross-fetch');

const CUSTOM_DL_PATH = "/tmp/godot_bin_download";

const GD_SCENE = 
`[gd_scene load_steps=2 format=2]

[ext_resource path="res://addons/gut/.cli_add/__rebuilder.gd" type="Script" id=1]

[node name="Label" type="Label"]
margin_right = 50.0
margin_bottom = 25.0
text = "5.603025"
script = ExtResource( 1 )
__meta__ = {
"_edit_use_anchors_": false
}
`;

const GD_REBUILDER = 
`# credit for this + tscn : https://github.com/Kersoph/open-sequential-logic-simulation/pull/4/files
tool
extends Label

var delay = 0.0

func _ready() -> void:
	push_warning("Starting reimport process...")

func _process(delta) -> void:
    # default delay is 10 frames
    # should be fine as this wont start until assets have been imported?
	delay = delay + delta
	text = String(delay)
	if (delay > 10):
		push_warning("Exiting reimport process...")
		OS.exit_code = 0
		get_tree().quit()
`;

(async () => {
  try {
    const INPUT = {
      version: core.getInput('version'),
      release_type: core.getInput('release_type'),
      path: core.getInput('path'),
      is_mono: core.getInput('is-mono'),
      import_time: core.getInput('import-time'),
      test_timeout: core.getInput('test-timeout'),
      minimum_pass: core.getInput('minimum-pass'),
      test_dir: core.getInput('test-dir'),
      direct_scene: core.getInput('direct-scene'),
      assert_check: core.getInput('assert-check'),
      max_fails: core.getInput('max-fails'),
      config_file: core.getInput('config-file'),
      custom_godot_dl_url: core.getInput('custom-godot-dl-url'),
      result_output_file: core.getInput('result-output-file'),
    };

    const generated_data = {};

    process.chdir(`./${INPUT.path}`);

    generated_data.is_v4 = set_is_version_four(INPUT);
    generated_data.godot_path = await download_godot(INPUT, generated_data.is_v4);
    generated_data.run_options = generate_run_options(INPUT, generated_data.is_v4);
    generated_data.test_results = await run_tests(INPUT, generated_data);
  
    console.log('godot-tester passed with test results: ', generated_data.test_results);
  } catch (error) {
    console.error('godot-tester action failure: ', error);
    core.setFailed(error.message);
  } finally {
    delete_gut_rebuilder();
    delete_godot();
  }
})();

function read_xml_dom() {

}

function add_gut_rebuilder() {

}

function delete_gut_rebuilder() {

}

function delete_godot() {
  let rebuilder_gd = './addons/gut/.cli_add/__rebuilder.gd';
  let rebuilder_tscn = './addons/gut/.cli_add/__rebuilder_scene.tscn';
  if (existsSync(rebuilder_gd)) {
    unlinkSync(rebuilder_gd);
  }
  if (existsSync(rebuilder_tscn)) {
    unlinkSync(rebuilder_tscn);
  }
}

// doing all these at once since they're intertwined: the url & the final executable path
// & the unzip path
function generate_all_godot_paths({release_type, version, is_mono, custom_godot_dl_url}, {is_v4}) {
  // if not stable, then the release type is specified in the url's path
  // This is the path to the godot version hosted on tuxfamily
  // example: 3.2.3/, 3.2.3/beta1/, etc.
  let url_path = `${version}/${release_type !== "stable" ? release_type : ''}/`;

  let godot_name = `Godot_v${version}-${release_type}`;
  let extension = ".";
  
  if (is_mono === "true") {
    // mono builds are in a subdirectory of the godot version + release
    // example: 3.2.3/mono/, 3.2.3/beta1/mono/, etc.
    url_path += "mono/";
    godot_name += "_mono";
    extension = "_";
  }

  godot_name += "_linux";

  if (is_v4) {
    // v4 no longer needs headless, but instead requires x86 extension
    console.log('Version 4+ detected');
    extension += "x86";
  } else {
    console.log('Version < 4 detected');
    godot_name += "_headless";
  }

  let godot_name_ext = `${godot_name}${extension}`;
  let godot_executable = `${CUSTOM_DL_PATH}/${godot_name_ext}`;

  // mono extracts into a subdirectory so we add the extended name twice
  if (is_mono === "true") {
    godot_executable += `/${godot_name_ext}`;
  }
  let dl_url = custom_godot_dl_url;

  if (dl_url !== "") {
    dl_url = `https://downloads.tuxfamily.org/godotengine/${url_path}${godot_name_ext}.zip`;
  }
  
  return [godot_name, godot_name_ext, dl_url, godot_executable];
}

// we additionally fill the cli folder with our rebuilder scene info
function create_required_folders() {
  const cache = homedir() + '/.cache';
  const godot_cfg = homedir() + '/.config/godot';
  const cli_folder = './addons/gut/.cli_add';

  // recreating this folder to clear out potential old downloads
  if (existsSync(CUSTOM_DL_PATH)){
    rmdirSync(CUSTOM_DL_PATH);
  }
  mkdirSync(CUSTOM_DL_PATH);

  // cache and config folders are necessary for testing
  if (!existsSync(cache)) {
    mkdirSync(cache);
  }
  if (!existsSync(godot_cfg)) {
    mkdirSync(godot_cfg);
  }

  // setting up the cli folder so importing works as expected
  if (!existsSync(cli_folder)) {
    mkdirSync(cli_folder);
  }

  writeFileSync(`${cli_folder}/__rebuilder.gd`, GD_REBUILDER);
  writeFileSync(`${cli_folder}/__rebuilder_scene.tscn`, GD_SCENE);
}

async function perform_download ({dl_url}) {
  const res = await fetch(dl_url);
  const fileStream = createWriteStream(CUSTOM_DL_PATH, { flags: 'wx' });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function unzip_godot({godot_name_ext}) {
  await extract(`${CUSTOM_DL_PATH}/${godot_name_ext}.zip`, { dir: CUSTOM_DL_PATH }); 
}

async function download_godot(INPUT, generated_data) {
  // set godot executable name + url 
  [generated_data.godot_name, generated_data.godot_name_ext, generated_data.dl_url, generated_data.godot_executable] = 
    generate_all_godot_paths(INPUT, generated_data);

  // delete and recreate the dl folder, in case there was a broken godot from a previous run
  create_required_folders();

  // Download the godot binary into the custom_dl_folder
  await perform_download(generated_data);

  // Unzip the godot binary
  await unzip_godot(generated_data);
}

function generate_run_options(
  {test_dir, result_output_file, config_file, direct_scene}, 
  is_v4
) {
  let run_options = `-s addons/gut/gut_cmdln.gd -gdir=${test_dir} -ginclude_subdirs `;
  run_options += `-gjunit_xml_file=./${result_output_file} -gexit`;
  if (direct_scene !== "false") {
    run_options = direct_scene;
  } else if (config_file !== "res://.gutconfig.json") {
    run_options += ` -gconfig=${config_file}`;
  }

  if (is_v4) {
    run_options += ' --headless';
  }
  return run_options;
}

function check_by_test() {

}

function check_by_assert() {

}

function calculate_pass_rate() {

}

async function run_tests(INPUT, generated_data) {
  // import 

  // run tests & return the output xml data
}


function analyze_test_results({assert_check, result_output_file}) {
  if (assert_check !== "false") {
    check_by_assert();
  } else {
    check_by_test();
  }
  if (existsSync(`./${result_output_file}`)) {
    unlinkSync(`./${result_output_file}`);
  }
  calculate_pass_rate();
}

function set_is_version_four({version}) {
  let v = version.split(".")[0];
  return v >= 4;
}