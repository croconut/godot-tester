extends "res://addons/gut/test.gd"

const main_scene = preload("res://main.tscn")
var scene
var current_scene

func before_all():
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)

func test_assert_one_less_than_two():
	assert_true(1 < 2)

func test_assert_oe_less_than_two():
	assert_true(1 < 2)

func test_assert_copy():
	assert_true(1 < 2)

func test_assert_copy1():
	assert_true(1 < 2)
	assert_true(3 < 2)
	assert_true(1 < 2)
	assert_true(2 < 2)
	assert_true(1 < 2)
	assert_true(1 < 2)

func test_assert_copy2():
	assert_true(1 < 2)

func test_assert_copy3():
	assert_true(1 < 2)

func test_assert_copy4():
	assert_true(1 < 2)

func test_load_scene1() ->void:
	scene = main_scene.instance()
	current_scene.add_child(scene)
	assert_true(11 < 4)
	# should fail pretty hard
	main_scene.blargh()
	
	assert_eq(scene.name, current_scene.get_node(scene.name).name)

func test_assert_is_wrong():
	assert_true(1 > 2)

func test_wait_test():
	yield(get_tree().create_timer(6.0), "timeout")
	assert_true(1 < 3)	

func test_load_scene() ->void:
	scene = main_scene.instance()
	current_scene.add_child(scene)
	# should fail pretty hard
	main_scene.blargh()
	assert_true(11 < 4)
	assert_eq(scene.name, current_scene.get_node(scene.name).name)
