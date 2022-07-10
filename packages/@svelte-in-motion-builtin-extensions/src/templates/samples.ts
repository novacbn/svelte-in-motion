import {define_template} from "@svelte-in-motion/extension";

export const TEMPLATE_SAMPLE_INTERPOLATION = define_template({
    identifier: "samples.interpolation",

    paths: {
        ".svelte-in-motion.json": `
{
    "framerate": 60,
    "height": 1080,
    "maxframes": 120,
    "width": 1920
}       
`,

        "Main.svelte": `
<script>
  import { CONTEXT_STATE } from "@svelte-in-motion/core";

  const opacity = CONTEXT_STATE.get({
    duration: 0.25,
  
    start: 0.65,
    end: {
      extrapolate: "wrap",
      value: 1
    },
  });
</script>

<div style="--opacity:{$opacity};" />

<style>
  div {
    display: grid;

    background: skyblue;

    width: 100vw;
    height: 100vh;

    opacity: var(--opacity);
  }
</style>
`,
    },
});

export const TEMPLATE_SAMPLE_RANDOM = define_template({
    identifier: "samples.random",

    paths: {
        ".svelte-in-motion.json": `
{
  "framerate": 60,
  "height": 1080,
  "maxframes": 120,
  "width": 1920
}       
`,

        "Main.svelte": `
<script>
  import StaticPellet from "./StaticPellet.svelte";

  const pellets = new Array(100).fill(null);
</script>

{#each pellets as _, index}
  <StaticPellet {index} />
{/each}

<style>
  :global(body) {
    background: white;
  }
</style>
`,

        "StaticPellet.svelte": `
<script>
  import { CONTEXT_RANDOM_FLOAT } from "@svelte-in-motion/core";
  import { random } from "@svelte-in-motion/utilities";
  
  export let index = 0;

  $: opacity = random(\`opacity-\${index}\`).float(0.65, 0.9);

  $: x = CONTEXT_RANDOM_FLOAT.get({
    seed: \`x-\${index}\`,
    end: 100,
    start: 0,
  });

  $: y = CONTEXT_RANDOM_FLOAT.get({
    seed: \`y-\${index}\`,
    end: 100,
    start: 0,
  });
</script>

<span style="--x:{$x}%;--y:{$y}%;--opacity:{opacity};" />

<style>
  :global(body) {
    background: white;
  }

  span {
    position: fixed;

    background: slategray;

    width: 0.25vw;
    height: 0.25vw;

    top: var(--x);
    left: var(--y);

    opacity: var(--opacity);
  }
</style>
`,
    },
});

export const TEMPLATE_SAMPLE_TRANSITIONS = define_template({
    identifier: "samples.transitions",

    paths: {
        ".svelte-in-motion.json": `
{
    "framerate": 60,
    "height": 1080,
    "maxframes": 120,
    "width": 1920
}       
`,

        "Main.svelte": `
<script>
  import { Fade, Rotate, Scale, Translate } from "@svelte-in-motion/animations";
</script>

<div>
  <Fade.In
    duration={2}
  >
    <section>
      <code>Fade In</code>
    </section>
  </Fade.In>

  <Fade.Out
    duration={2}
  >
    <section>
      <code>Fade Out</code>
    </section>
  </Fade.Out>

  <Rotate.In
    duration={2}
    start="180deg"
    end="0deg"
  >
    <section>
      <code>Rotate In</code>
    </section>
  </Rotate.In>

  <Rotate.Out
    duration={2}
    start="0deg"
    end="180deg"
  >
    <section>
      <code>Rotate Out</code>
    </section>
  </Rotate.Out>

  <Scale.In
    duration={2}
  >
    <section>
      <code>Scale In</code>
    </section>
  </Scale.In>

  <Scale.Out
    duration={2}
  >
    <section>
      <code>Scale Out</code>
    </section>
  </Scale.Out>

  <Translate.In
    duration={2}
    start_x="100%"
  >
    <section>
      <code>Translate In</code>
    </section>
  </Translate.In>

  <Translate.Out
    duration={2}
    end_x="100%"
  >
    <section>
      <code>Translate Out</code>
    </section>
  </Translate.Out>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  div {
    display: grid;

    gap: 2rem;

    grid-auto-flow: row dense;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);

    width: 100vw;
    height: 100vh;
  }

  section {
    display: flex;

    align-items: center;
    justify-content: center;

    background: skyblue;
    border: 1px solid black;
    color: whitesmoke;

    height: 100%;
  }
</style>
`,
    },
});
