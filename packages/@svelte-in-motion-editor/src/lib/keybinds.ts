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

export const action_toggle_checkerboard = make_keybind_shortcut({
    binds: ["c"],
});

export const action_toggle_play = make_keybind_shortcut({
    binds: [" "],
});

export const action_toggle_script = make_keybind_shortcut({
    binds: ["s"],
});

export const action_toggle_zen = make_keybind_shortcut({
    binds: ["f", "z"],
});
