FROM croconut/godot-test:latest

ENTRYPOINT ["sh", "-c", \
    "ls \
    echo $(ls $GITHUB_WORKSPACE) \
    echo $(ls $GITHUB_HOME) \
    godot -d -s --path $GITHUB_WORKSPACE addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit"]