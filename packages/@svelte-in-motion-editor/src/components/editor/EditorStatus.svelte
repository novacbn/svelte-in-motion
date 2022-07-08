<script lang="ts">
    import {Spacer, Text} from "@kahi-ui/framework";

    import {CONTEXT_WORKSPACE} from "../../lib/workspace";

    import AppStatus from "../app/AppStatus.svelte";

    const {configuration, metadata} = CONTEXT_WORKSPACE.get()!;
</script>

<AppStatus>
    <Text sizing="nano">
        {$metadata.name}
    </Text>

    <Spacer />

    <Text sizing="nano">
        {$configuration.width}x{$configuration.height}
    </Text>

    <Spacer />

    <Text sizing="nano">
        {$configuration.framerate} FPS
    </Text>
</AppStatus>
