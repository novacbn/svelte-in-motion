<script lang="ts">
    import FlexSearch from "flexsearch";
    import type {IKeybindEvent} from "@kahi-ui/framework";
    import {action_submit} from "@kahi-ui/framework";
    import {
        Card,
        Form,
        Scrollable,
        Stack,
        Text,
        TextInput,
        navigate_down,
        navigate_up,
    } from "@kahi-ui/framework";
    import {createEventDispatcher} from "svelte";

    import {clamp} from "@svelte-in-motion/utilities";

    import type {ISearchPromptPromptEvent} from "../../lib/stores/prompts";

    type $$Events = {
        resolve: CustomEvent<ISearchPromptPromptEvent>;
    };

    const dispatch = createEventDispatcher();

    export let identifier: string;
    export let index: string[];
    export let title: string;

    export let documents: Record<string, string>[];

    export let limit: number | undefined = undefined;

    let result_elements: HTMLDivElement[] = [];

    let query: string;
    let selected: number = 0;

    const lookup = Object.fromEntries(
        documents.map((document) => {
            return [document[identifier], document];
        })
    );

    const weights = Object.fromEntries(
        index.map((field, index, index_array) => {
            return [field, index_array.length - index];
        })
    );

    const engine = new FlexSearch.Document({
        tokenize: "full",
        preset: "match",

        document: {
            id: identifier,
            index,
        },
    });

    for (const document of documents) engine.add(document);

    function on_result_arrow(delta: number, event: IKeybindEvent): void {
        event.preventDefault();
        if (!event.detail.active) return;

        selected = clamp(selected + delta, 0, results.length - 1);

        const element = result_elements[selected];
        element.scrollIntoView({behavior: "smooth", block: "nearest"});
    }

    function on_result_click(event: MouseEvent, index: number): void {
        event.preventDefault();

        const document = results[index];

        dispatch("resolve", {
            identifier: document["identifier"],
        });
    }

    function on_result_enter(event: IKeybindEvent): void {
        event.preventDefault();
        if (!event.detail.active) return;

        const document = results[selected];

        dispatch("resolve", {
            identifier: document["identifier"],
        });
    }

    function on_result_select(event: PointerEvent, index: number): void {
        selected = index;
    }

    let results: Record<string, string>[] = [];
    $: {
        const rankings: Record<string, number> = {};
        const fields = engine.search(query, limit);

        for (const field of fields) {
            const weight = weights[field.field];

            for (const identifier of field.result) {
                rankings[identifier] = (rankings[identifier] ?? 0) + weight;
            }
        }

        const entries = Object.entries(rankings);

        selected = 0;

        results =
            entries.length > 0
                ? entries
                      .map(([identifier, weight]) => {
                          const document = lookup[identifier];

                          return {
                              document,
                              weight,
                          };
                      })
                      .sort((entry_a, entry_b) => {
                          const title_a = entry_a.document[title].toLowerCase();
                          const title_b = entry_b.document[title].toLowerCase();

                          return title_a <= title_b ? -1 : 0;
                      })
                      .sort((entry_a, entry_b) => {
                          const weight_a = entry_a.weight;
                          const weight_b = entry_b.weight;

                          return weight_b - weight_a;
                      })
                      .map((entry) => entry.document)
                : documents.slice().sort((entry_a, entry_b) => {
                      const title_a = entry_a[title].toLowerCase();
                      const title_b = entry_b[title].toLowerCase();

                      return title_a <= title_b ? -1 : 0;
                  });
    }
</script>

<Card.Section>
    <Form.Control logic_id="search-prompt-query">
        <TextInput
            sizing="nano"
            bind:value={query}
            actions={[
                [navigate_up, {on_bind: on_result_arrow.bind(null, -1)}],
                [navigate_down, {on_bind: on_result_arrow.bind(null, 1)}],
                [action_submit, {on_bind: on_result_enter}],
            ]}
        />
    </Form.Control>
</Card.Section>

<Card.Section width="large" margin_x="none" margin_top="small" margin_bottom="none">
    <Scrollable max_height="medium">
        <Stack.Container spacing="tiny">
            {#each results as result, index (result[identifier])}
                <div
                    bind:this={result_elements[index]}
                    class="box"
                    data-palette={index === selected ? "accent" : "inherit"}
                    data-padding-x="tiny"
                    data-padding-y="nano"
                    style="cursor:pointer;"
                    on:pointerenter={(event) => on_result_select(event, index)}
                    on:click={(event) => on_result_click(event, index)}
                >
                    <Text sizing="small">
                        {result[title]}
                    </Text>
                </div>
            {/each}
        </Stack.Container>
    </Scrollable>
</Card.Section>
