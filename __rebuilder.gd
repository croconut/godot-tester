# credit for this + tscn : https://github.com/Kersoph/open-sequential-logic-simulation/pull/4/files
tool
extends Label

var delay = 0.0

func _ready() -> void:
	push_warning("Starting reimport process...")

func _process(delta) -> void:
    # default delay is 10 frames
    # should be fine as this wont start until assets have been imported?
	delay = delay + delta
	text = String(delay)
	if (delay > 10):
		push_warning("Exiting reimport process...")
		OS.exit_code = 0
		get_tree().quit()