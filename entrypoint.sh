#!/bin/sh -l

echo $(ls)
echo $(ls $GITHUB_WORKSPACE)
echo $(ls $GITHUB_HOME)
godot -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit