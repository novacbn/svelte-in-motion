import type {IKeybindOptions, IKeybindShortcutAction} from "@kahi-ui/framework";
import {keybind} from "@kahi-ui/framework";

function make_keybind_shortcut(
    factory_options: Omit<IKeybindOptions, "on_bind">
): IKeybindShortcutAction {
    // NOTE: ... I forgot to actually export this function in the latest Kahi UI version :/

    return (element, {on_bind}) => {
        const {destroy, update} = keybind(element, {...factory_options, on_bind});

        return {
            destroy,

            update({on_bind}) {
                update({...factory_options, on_bind});
            },
        };
    };
}

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
