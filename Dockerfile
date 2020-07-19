FROM croconut/godot-test:latest

ENTRYPOINT ["sh", "-c", \
    "ls; godot -d -s --path $GITHUB_WORKSPACE addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit"]