extends "res://addons/gut/test.gd"

const main_scene = preload("res://main.tscn")
var scene
var current_scene

func before_all():
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)

func test_assert_one_less_than_two():
	assert_true(1 < 2)
	
func test_load_scene() ->void:
	scene = main_scene.instance()
	current_scene.add_child(scene)
	assert_eq(scene.name, current_scene.get_node(scene.name).name)
