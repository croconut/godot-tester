# godot-tester

A Github Action to handle automated testing of Godot applications.

Assumes that you have installed and are using GUT as your testing framework.

## setup
 
Checkout your repository with actions/checkout then use this action.

Example workflow:
 
~~~ yaml

name: Godot Testing
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: croconut/godot-tester@v0.2

~~~~

## upcoming

Support for arbitrary Godot versions coming soon.
