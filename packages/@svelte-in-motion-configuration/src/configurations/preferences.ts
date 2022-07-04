import {DataClass} from "@svelte-in-motion/type";

import {Configuration} from "./configuration";

export const DEFAULT_LOCALE = "en-US";

export const SUPPORTED_LOCALES = ["en-US"] as const;

export type ISupportedLocales = typeof SUPPORTED_LOCALES[number];

export class PreferencesLocaleConfiguration extends DataClass {
    preferred?: ISupportedLocales;
}

export class PreferencesUIEditorFileTreeConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIEditorScriptConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIEditorConfiguration extends DataClass {
    file_tree: PreferencesUIEditorFileTreeConfiguration =
        new PreferencesUIEditorFileTreeConfiguration();

    script: PreferencesUIEditorScriptConfiguration = new PreferencesUIEditorScriptConfiguration();
}

export class PreferencesUIPreviewCheckerboardConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIPreviewControlsConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIPreviewTimelineConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIPreviewViewportConfiguration extends DataClass {
    enabled: boolean = true;
}

export class PreferencesUIPreviewConfiguration extends DataClass {
    checkerboard: PreferencesUIPreviewCheckerboardConfiguration =
        new PreferencesUIPreviewCheckerboardConfiguration();

    controls: PreferencesUIPreviewControlsConfiguration =
        new PreferencesUIPreviewControlsConfiguration();

    timeline: PreferencesUIPreviewTimelineConfiguration =
        new PreferencesUIPreviewTimelineConfiguration();

    viewport: PreferencesUIPreviewViewportConfiguration =
        new PreferencesUIPreviewViewportConfiguration();
}

export class PreferencesUIConfiguration extends DataClass {
    editor: PreferencesUIEditorConfiguration = new PreferencesUIEditorConfiguration();

    preview: PreferencesUIPreviewConfiguration = new PreferencesUIPreviewConfiguration();
}

export class PreferencesConfiguration extends Configuration {
    locale: PreferencesLocaleConfiguration = new PreferencesLocaleConfiguration();

    ui: PreferencesUIConfiguration = new PreferencesUIConfiguration();
}
