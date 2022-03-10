# API

## `@svelte-in-motion/animations`

### `Fade`

`Fade` Component provides the ability to change the opacity of the child content depending on current animation state.

**PROPERTIES**

-   `delay: number` — Controls how long into the current animation in seconds until the transition should run.
-   `duration: number` — Controls how long in seconds the transition should run for.
-   `easing: IEasingFunction` — Alters the easing function used for transition playback.
-   `end: number` — Controls the opacity value that the transition should stop at.
-   `start: number` — Controls the opacity value that the transition should start at.

```svelte
<script>
    import {Fade} from "@svelte-in-motion/animations";
</script>

<Fade.In delay={0} duration={1}>
    <Fade.Out delay={2} duration={1}>
        I fade in, then out!
    </Fade.Out>
</Fade.In>
```

### `Rotate`

`Rotate` Component provides the ability to rotate the child content depending on current animation state.

**PROPERTIES**

-   `delay: number` — Controls how long into the current animation in seconds until the transition should run.
-   `duration: number` — Controls how long in seconds the transition should run for.
-   `easing: IEasingFunction` — Alters the easing function used for transition playback.
-   `end: string` — Controls the CSS angle that the transition should stop at.
-   `start: string` — Controls the CSS angle that the transition should start at.

```svelte
<script>
    import {Rotate} from "@svelte-in-motion/animations";
</script>

<Rotate.In delay={0} duration={1} end="90deg">
    <Rotate.Out delay={2} duration={1} end="-90deg">
        I fade in, then out!
    </Rotate.Out>
</Rotate.In>
```

### `Scale`

`Scale` Component provides the ability to scale down / up the child content depending on current animation state.

**PROPERTIES**

-   `delay: number` — Controls how long into the current animation in seconds until the transition should run.
-   `duration: number` — Controls how long in seconds the transition should run for.
-   `easing: IEasingFunction` — Alters the easing function used for transition playback.
-   `end_x: number` — Controls the horizontal scaling that the transition should stop at.
-   `end_y: number` — Controls the vertical scaling that the transition should stop at.
-   `start_x: number` — Controls the horizontal scaling that the transition should start at.
-   `start_y: number` — Controls the vertical scaling that the transition should start at.

```svelte
<script>
    import {Scale} from "@svelte-in-motion/animations";
</script>

<Scale.In delay={0} duration={1} start_x={0.25}>
    <Scale.Out delay={2} duration={1} end_x={0.25}>
        I fade in, then out!
    </Scale.Out>
</Scale.In>
```

### `Translate`

`Translate` Component provides the ability to translate the child content depending on current animation state.

**PROPERTIES**

-   `delay: number` — Controls how long into the current animation in seconds until the transition should run.
-   `duration: number` — Controls how long in seconds the transition should run for.
-   `easing: IEasingFunction` — Alters the easing function used for transition playback.
-   `end_x: string` — Controls the CSS horizontal units that the transition should stop at.
-   `end_y: string` — Controls the CSS vertical units that the transition should stop at.
-   `start_x: string` — Controls the CSS horizontal units that the transition should start at.
-   `start_y: string` — Controls the CSS vertical units that the transition should start at.

```svelte
<script>
    import {Translate} from "@svelte-in-motion/animations";
</script>

<Translate.In delay={0} duration={1} start_x="-100px">
    <Translate.Out delay={2} duration={1} end_y="100px">
        I fade in, then out!
    </Translate.Out>
</Translate.In>
```
