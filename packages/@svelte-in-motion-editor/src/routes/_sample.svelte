<div class="content">
    <Translate.In
        class="background--transition"
        delay={0.25}
        duration={1.25}
        easing={bounceOut}
        units_y="-100px"
    >
        <Fade.In class="background--transition" delay={0.25} duration={1.25}>
            <Fade.Out class="background--transition" delay={2} duration={0.5}>
                <Translate.Out
                    class="background--transition"
                    delay={2}
                    duration={0.5}
                    units_y="-100px"
                >
                    <Rotate.Out
                        class="background--transition"
                        delay={2}
                        duration={0.5}
                        rotation="-90deg"
                    >
                        <div class="background--box" />
                    </Rotate.Out>
                </Translate.Out>
            </Fade.Out>
        </Fade.In>
    </Translate.In>

    <Scale.In delay={0.25} duration={1.25} easing={bounceOut}>
        <Fade.Out delay={2} duration={0.5}>
            <Translate.Out delay={2} duration={0.5} units_y="100px">
                <Rotate.Out delay={2} duration={0.5} rotation="90deg">
                    <h1>Hello World</h1>
                </Rotate.Out>
            </Translate.Out>
        </Fade.Out>
    </Scale.In>
</div>

<style>
    :global(.content) {
        display: flex;
        position: relative;

        align-items: center;
        justify-content: center;

        width: 15rem;
        height: 7.5rem;
    }

    :global(.background--transition) {
        position: absolute;

        inset: 0;
    }

    :global(.background--box) {
        position: absolute;
        inset: 0;

        background: skyblue;
    }
</style>
