<script lang="ts">
    import {Button, Card, Form, Stack} from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {PromptDismissError} from "@svelte-in-motion/utilities";
    import type {TypeObjectLiteral} from "@svelte-in-motion/type";

    import type {IFormPromptEvent, IPromptRejectEvent} from "../../lib/stores/prompts";

    import {CONTEXT_APP} from "../../lib/app";

    import FormRender from "../form/FormRender.svelte";

    const {prompts} = CONTEXT_APP.get()!;

    type $$Events = {
        reject: CustomEvent<IPromptRejectEvent>;

        resolve: CustomEvent<IFormPromptEvent<unknown>>;
    };

    const dispatch = createEventDispatcher();

    export let model: any;
    export let type: TypeObjectLiteral;

    function on_dismiss_click(event: MouseEvent): void {
        dispatch("reject", {
            error: new PromptDismissError(),
        });
    }

    function on_submit_click(event: MouseEvent): void {
        /*dispatch("resolve", {
           
        });*/
    }
</script>

<Card.Section>
    <Stack.Container spacing="small">
        <FormRender prefix="ui-prompt-form-" {model} {type} />
    </Stack.Container>
</Card.Section>
