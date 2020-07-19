FROM croconut/godot-test:latest

ENTRYPOINT ["sh", "-c", \
    "godot -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit"]