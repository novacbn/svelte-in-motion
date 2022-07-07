<script lang="ts">
    import {Card, Progress, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher, onMount} from "svelte";

    type $$Events = {
        resolve: CustomEvent<void>;
    };

    const dispatch = createEventDispatcher();

    export let signal: AbortSignal;

    function on_abort(event: Event): void {
        dispatch("resolve");
    }

    onMount(() => {
        signal.addEventListener("abort", on_abort);
        return () => signal.removeEventListener("abort", on_abort);
    });
</script>

<Card.Section margin="medium">
    <Stack.Container alignment="center">
        <Progress shape="circle" palette="accent" />
    </Stack.Container>
</Card.Section>
