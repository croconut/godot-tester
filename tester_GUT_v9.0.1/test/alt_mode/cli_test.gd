extends Control

func _ready():
	var template_file = FileAccess.open("res://test/alt_mode/scene_test_output.xml", FileAccess.READ)
	var content = template_file.get_as_text()
	var output_file = FileAccess.open("res://direct_scene_xml_output.xml", FileAccess.WRITE)
	output_file.store_string(content)
	get_tree().quit()
