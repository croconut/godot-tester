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
CONFIG_FILE=${12}
CUSTOM_GODOT_DL_URL=${13}
RESULT_OUTPUT_FILE=${14}

# Internal variables
IS_VERSION_FOUR=0
exitval=1
CUSTOM_DL_PATH="~/custom_dl_folder"
TESTS=0
FAILED=0

# Import functions
source ./test_runner_lib/functions.sh

cd ./${PROJECT_DIRECTORY}

check_godot_version
download_godot
run_tests
analyze_test_results

exit ${exitval}