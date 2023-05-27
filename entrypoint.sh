#!/bin/bash -e
# switching to bash for pipestatus functionality

set -e

GODOT_VERSION=$1
RELEASE_TYPE=$2
PROJECT_DIRECTORY=$3
IS_MONO=$4
IMPORT_TIME=$5
TEST_TIME=$6
MINIMUM_PASSRATE=$7
TEST_DIR=$8
DIRECT_SCENE=$9
# args above 9 require brackets
ASSERT_CHECK=${10}
MAX_FAILS=${11}
IGNORE_ERROR=${12}
CONFIG_FILE=${13}
CUSTOM_GODOT_DL_URL=${14}
RESULT_OUTPUT_FILE=${15}

# Internal variables
exitval=1
CUSTOM_DL_PATH="~/custom_dl_folder"
TESTS=0
FAILED=0

# Import functions
source ./test_runner_lib/functions.sh

cd ./${PROJECT_DIRECTORY}

download_godot
run_tests
analyze_test_results

exit ${exitval}