# godot-tester

A Github Action to handle automated testing of Godot applications.

Assumes that you have installed and are using GUT as your testing framework.

## setup

Checkout your repository with actions/checkout then use this action.

Example workflow:

~~~ yaml

name: Godot testing

on: [ push ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: croconut/godot-tester@v1
      with:
        version: "3.2.1"
        is-mono: "true"
        # the folder with your projects.godot file in it
        path: "tester"

~~~~
