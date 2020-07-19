#!/bin/sh -l

ls
ls $GITHUB_WORKSPACE
ls $GITHUB_HOME
godot -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit