import {make_keybind_shortcut} from "@kahi-ui/framework";

export const action_next_frame = make_keybind_shortcut({
    binds: "arrowright",
    repeat: true,
    repeat_throttle: 250,
    throttle_cancel: true,
});

export const action_previous_frame = make_keybind_shortcut({
    binds: "arrowleft",
    repeat: true,
    repeat_throttle: 250,
    throttle_cancel: true,
});

export const action_toggle_play = make_keybind_shortcut({
    binds: [" "],
});

export const action_toggle_file_tree = make_keybind_shortcut({
    binds: ["control", "f"],
});

export const action_toggle_script = make_keybind_shortcut({
    binds: ["control", "s"],
});

export const action_toggle_checkerboard = make_keybind_shortcut({
    binds: ["control", "b"],
});

export const action_toggle_controls = make_keybind_shortcut({
    binds: ["control", "l"],
});

export const action_toggle_timeline = make_keybind_shortcut({
    binds: ["control", "t"],
});

export const action_toggle_viewport = make_keybind_shortcut({
    binds: ["control", "v"],
});
