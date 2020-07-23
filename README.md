# godot-tester
![Build tester](https://github.com/croconut/godot-tester/workflows/Build%20tester/badge.svg)

A Github Action to handle automated testing of Godot applications.

Assumes that you have installed and are using GUT as your testing framework.

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
    - uses: croconut/godot-tester@v2
      with:
        # required
        version: "3.2.2"
        is-mono: "true"
        # the folder with your projects.godot file in it
        path: "tester"
        # how long to spend importing assets before tests are run
        import-time: "5"

~~~~

Godot does not automatically import, so I'm including an option 
to allot a specified amount of time to import your images and objects, if you 
need these imported for your tests.
