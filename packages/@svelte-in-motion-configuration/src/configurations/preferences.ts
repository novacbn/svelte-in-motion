import {DataClass} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export class PreferencesUIEditorFileTreeConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIEditorScriptConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIEditorConfiguration extends DataClass {
    readonly file_tree: PreferencesUIEditorFileTreeConfiguration =
        new PreferencesUIEditorFileTreeConfiguration();

    readonly script: PreferencesUIEditorScriptConfiguration =
        new PreferencesUIEditorScriptConfiguration();
}

export class PreferencesUIPreviewCheckerboardConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIPreviewControlsConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIPreviewTimelineConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIPreviewViewportConfiguration extends DataClass {
    readonly enabled: boolean = true;
}

export class PreferencesUIPreviewConfiguration extends DataClass {
    readonly checkerboard: PreferencesUIPreviewCheckerboardConfiguration =
        new PreferencesUIPreviewCheckerboardConfiguration();

    readonly controls: PreferencesUIPreviewControlsConfiguration =
        new PreferencesUIPreviewControlsConfiguration();

    readonly timeline: PreferencesUIPreviewTimelineConfiguration =
        new PreferencesUIPreviewTimelineConfiguration();

    readonly viewport: PreferencesUIPreviewViewportConfiguration =
        new PreferencesUIPreviewViewportConfiguration();
}

export class PreferencesUIConfiguration extends DataClass {
    readonly editor: PreferencesUIEditorConfiguration = new PreferencesUIEditorConfiguration();

    readonly preview: PreferencesUIPreviewConfiguration = new PreferencesUIPreviewConfiguration();
}

export class PreferencesConfiguration extends Configuration {
    readonly ui: PreferencesUIConfiguration = new PreferencesUIConfiguration();
}
