# godot-tester

A Github Action to handle automated testing of Godot applications

Assumes that you have installed and are using GUT as your testing framework

## how to use this in your workflow
 
checkout your repository with actions/checkoutv2 then use this action
 
~~~ yaml
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: croconut/godot-tester@v0.2
~~~~
