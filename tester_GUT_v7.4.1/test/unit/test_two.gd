extends "res://addons/gut/test.gd"

const main_scene = preload("res://main.tscn")
var scene
var current_scene

func before_all():
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)

func test_another():
	assert_true(1 < 2)

func test_2():
	assert_true(1 < 2)

func test_again():
	assert_true(1 < 2)

func test_it():
	assert_true(1 < 2)
	assert_true(1 < 2)
	assert_true(1 < 2)
	assert_true(1 < 2)
	assert_true(1 < 2)
	assert_true(1 < 2)