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

## `@svelte-in-motion/core`

### `interpolate`

`interpolate` is a Svelte Store that iterates on numeric value ranges it was configured with, outputing values when given new ratios.

**ARGUMENTS**

-   `state?: number` — Configures the initial ratio.
-   `options?: IInterpolateOptions` — Configures the `interpolate` store.

    -   `IInterpolateOptions.easing?: IEasingFunction` — Alters the easing function used for iterations.
    -   `IInterpolateOptions.end?: IInterpolateRangeOptions` - Controls the behavior of the minimum value that should be used.

        -   `IInterpolateRangeOptions.extrapolate?: "clamp" | "extend" | "wrap"`

            -   `clamp` — When out of range, the output value is clamped to this range.
            -   `extend` — When out of range, the output value is allowed to iterate pasts this range.
            -   `wrap` — When out of range, the output value iterates towards the opposite range and then back to this range.

        -   `IInterpolateRangeOptions.value?: number` — Controls the value of this range.

    -   `IInterpolateOptions.start?: IInterpolateRangeOptions` - Controls the behavior of the maximum value the should be used.

```svelte
<script>
    import {interpolate} from "@svelte-in-motion/core";

    // We're making a Store that will bounce between the
    // opacity range of `0.25...1` as it increments. Creating
    // the "pulsating glow" effect
    const pulse = interpolate(0, {
        start: 0.25,
        end: {
            value: 1,
            extrapolate: "wrap",
        },
    });

    // Will update the Store to output `0.5625` opacity
    $pulse = 0.75;
</script>

<span style="opacity:{$pulse};">
    Hello World
</span>
```

### `state`

`state` is a Svelte Store that inherits `interpolate` and links the input state to the state of the current animation.

**ARGUMENTS**

-   `options: IStateOptions` - Configures the `state` store.

    -   `IStateOptions.delay?: number` — Controls how long into the animation in seconds until the Store iterations should start.
    -   `IStateOptions.duration?: number` — Controls how long in seconds the Store's iterations should run for.
    -   `IStateOptions.frame: IFrameStore` — Provides the current frame Store that `state` should derive iterations from.
    -   `IStateOptions.framerate: IFramerateStore` — Provides the animation framerate Store that `state` should derive iterations from.
    -   `IStateOptions.easing?: IEasingFunction` — Alters the easing function used for iterations.
    -   `IStateOptions.end?: IInterpolateRangeOptions` - Controls the behavior of the minimum value that should be used.

        -   `IInterpolateRangeOptions.extrapolate?: "clamp" | "extend" | "wrap"`

            -   `clamp` — When out of range, the output value is clamped to this range.
            -   `extend` — When out of range, the output value is allowed to iterate pasts this range.
            -   `wrap` — When out of range, the output value iterates towards the opposite range and then back to this range.

        -   `IInterpolateRangeOptions.value?: number` — Controls the value of this range.

    -   `IStateOptions.start?: IInterpolateRangeOptions` - Controls the behavior of the maximum value the should be used.

```svelte
<script>
    import {CONTEXT_STATE} from "@svelte-in-motion/core";

    // By using `CONTEXT_STATE.get`, we can skip having to
    // provide the `frame` / `framerate` Stores. It'll automatically
    // fetch those Stores from the current animation's Svelte Context
    const pulse = CONTEXT_STATE.get({
        duration: 0.5,

        start: 0.25,
        end: {
            value: 1,
            extrapolate: "wrap",
        },
    });
</script>

<span style="opacity:{$pulse};">
    Hello World
</span>
```
