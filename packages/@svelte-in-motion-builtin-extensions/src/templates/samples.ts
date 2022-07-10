import {define_template} from "@svelte-in-motion/extension";

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
