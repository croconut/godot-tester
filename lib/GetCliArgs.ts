import { getInput } from '@actions/core';
import { coerce, SemVer } from 'semver';
import { join } from 'path';

export interface ActionInput {
  godotVersion: SemVer,
  projectPath: string,
  godotFourPlus: boolean,
  releaseType: string,
  path: string,
  isMono: boolean,
  importTime: number,
  testTimeout: number,
  minimumPass: number,
  testDir: string,
  directScene?: string,
  assertCheck: boolean,
  maxFails?: number,
  configFile: string,
  customGodotDlUrl: URL | null,
  resultOutputFile: string,
  workspace: string,
  thisActionDir: string
}

/// pulls arguments for this action directly from the env variables
/// github sets and does minor checks for valid input
export default function getCliArgs(): ActionInput {
    let version = coerce(getInput('version'));
    let customUrlRaw = getInput('custom-godot-dl-url');
    let directScene = getInput('direct-scene');
    let maxFails = getInput('max-fails');
    let workspace = process.env.GITHUB_WORKSPACE;
    let thisActionDir = process.env.THIS_ACTION_DIR;
    let actionPath = getInput('path');

    if (!workspace || !thisActionDir) {
      throw {msg: 'unexpected error: invalid github actions environment'};
    }

    let customUrl: URL | null = null;
    if (version === null) {
      throw {msg: 'bad godot version given ' + getInput('version')};
    }
    try {
      if (customUrlRaw !== '') {
        customUrl = new URL(customUrlRaw);
      }
    } catch (_e: unknown) {
      throw {msg: 'bad custom godot url given ' + customUrlRaw};
    }
    let input: ActionInput = {
      projectPath: join(workspace, actionPath),
      godotVersion: version,
      godotFourPlus: version.major > 3,
      releaseType: getInput('release_type'),
      path: getInput('path'),
      isMono: getInput('is-mono') !== 'false',
      importTime: parseFloat(getInput('import-time')),
      testTimeout: parseFloat(getInput('test-timeout')),
      minimumPass: parseFloat(getInput('minimum-pass')),
      testDir: getInput('test-dir'),
      assertCheck: getInput('assert-check') === 'true',
      configFile: getInput('config-file'),
      customGodotDlUrl: customUrl,
      resultOutputFile: getInput('result-output-file'),
      workspace: workspace,
      thisActionDir: thisActionDir,
    };

    if (directScene !== 'false') {
      input.directScene = directScene;
    }
    if (maxFails !== 'false') {
      input.maxFails = parseInt(maxFails);
      if (isNaN(input.maxFails)) {
        throw {msg: 'bad integer input for max-fails'};
      }
    }
    if (isNaN(input.importTime) ||
        isNaN(input.testTimeout) ||
        isNaN(input.minimumPass)
    ) {
      throw {msg: 'bad numeric input for one of: import-time, test-timeout, minimum-pass'}
      }
    return input;
};
