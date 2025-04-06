# godot-tester
![Build tester](https://github.com/croconut/godot-tester/workflows/Build%20tester/badge.svg)

A Github Action to handle automated testing of Godot applications.

Assumes that you have installed and are using GUT as your testing framework.

## GUT CLI alternatives

You can also run your own testing framework if you have a scene that can run tests on load and then exit.

You would use the 'direct-scene' option for that and you'll want the output for that scene to be an XML file following GUT's export results format: [GUT Export Document](https://bitwes.github.io/GutWiki/Godot4/Export-Test-Results.html)

Refer to the folder "/tester_GUT_v9.0.1/test/alt_mode" to see how to setup an override test scene for GUT, for use when GUT's CLI isn't working for your project.

## setup

Checkout your repository with actions/checkout then use this action.
The version of Godot you want to test against is required (e.g. "3.2.2")

Example workflow:

~~~ yaml

name: Godot testing

on: [ push ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: croconut/godot-tester@v5.2
      with:
        # required
        version: "4.0.3"
        # the type of release of godot that the tests should be run with
        release_type: "rc2"
        is-mono: "true"
        # the folder with your project.godot file in it
        path: "tester"
        # how long to spend importing assets before tests are run
        import-time: "5"
        # how long tests can run in seconds
        test-timeout: "45"
        # the ratio of tests that must pass for this action to pass
        # e.g. 0.6 means 60% of your tests must pass
        minimum-pass: "0.6"
        # the directory containing Gut tests
        test-dir: "res://test"
        # instead of running GUT's command line tool, 
        # you can run a test scene if you have one
        # set up a scene like in this repo --> located at /tester_GUT_v9.0.1/test/alt_mode/tests.tscn
        # set up a script like in this repo --> located at /tester_GUT_v9.0.1/test/alt_mode/cli_test.gd
        # ensure that the script exits on test completion
        # uses relative path from your godot project directory
        direct-scene: "tester_GUT_v9.0.1/test/alt_mode/tests.tscn" 
        # default is false, set true to count asserts instead of tests
        assert-check: "true" 
        # not checked by default, set to a number to limit the 
        # maximum amount of failed tests for a passing test suite
        max-fails: 3  
        # default is GUTs default: 'res://.gutconfig.json'; set this to load a different config file
        config-file: "res://.myconfig.json" 
        # designate a custom url to download the godot binary from (e.g. https://download_url.com/godot/example_download.zip)
        custom-godot-dl-url: ""
        # designate a custom path to execute the godot binary (e.g. relative_filename.exe)
        custom-godot-binary-path: ""
        # relative path to the xml file to read / write GUT's results from, recommended
        # for direct-scene users to check this file if you have issues
        result-output-file: "test_results.xml"

~~~~

The import process has been recently improved but you may still see issues until Godot has a native solution for CLI.

The direct-scene and config-file options are mutually exclusive - if you use direct-scene you will need to edit that scene to reflect the GUT options you want to set.
