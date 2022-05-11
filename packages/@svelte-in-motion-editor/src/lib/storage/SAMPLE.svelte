<script>
    const rotation = CONTEXT_STATE.get({
        delay: 1.5,
        duration: 0.5,
        easing: cubicInOut,

        start: 0,
        end: 0.5,
    });
</script>

<Fade.Out delay={4} duration={0.5}>
    <Scale.In class="logo-scale-in" duration={1} easing={bounceOut}>
        <Translate.Out delay={1.5} duration={0.5} easing={cubicInOut} end_y="-15vh">
            <svg
                class="logo-svelte"
                enable-background="new 0 0 98.1 118"
                viewBox="0 0 98.1 118"
                xmlns="http://www.w3.org/2000/svg"
                style="--rotation:{$rotation};"
            >
                <path
                    d="m91.8 15.6c-10.9-15.7-32.6-20.3-48.2-10.4l-27.5 17.6c-7.5 4.7-12.7 12.4-14.2 21.1-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-9-.4-18.2-5.7-25.5"
                    fill="#ff3e00"
                />

                <path
                    d="m40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.4 3.4 7.1 2.7.6-.2 1.2-.4 1.7-.7l27.4-17.5c1.4-.9 2.3-2.2 2.6-3.8s-.1-3.3-1-4.6c-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-10.5 6.7c-1.7 1.1-3.6 1.9-5.6 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.4-9.9-3.4-15.3.9-5.2 4.1-9.9 8.6-12.7l27.5-17.5c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.5 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-27.4 17.5c-1.4.9-2.3 2.2-2.6 3.8s.1 3.3 1 4.6c1.6 2.3 4.4 3.3 7.1 2.6.6-.2 1.2-.4 1.7-.7l10.5-6.7c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.9-8.6 12.7l-27.5 17.5c-1.7 1.1-3.6 1.9-5.6 2.5"
                    fill="#fff"
                />
            </svg>
        </Translate.Out>
    </Scale.In>

    <Scale.In class="subtext-scale-in" delay={1.75} duration={0.5} easing={backOut}>
        <Rotate.In delay={1.75} duration={0.5} easing={cubicInOut} start="20deg" end="0deg">
            <span class="subtext">
                Welcome to <b>Svelte-In-Motion</b>
            </span>
        </Rotate.In>
    </Scale.In>
</Fade.Out>

<style>
    :global(html, body) {
        width: 100%;
        height: 100%;

        background: #fff;
    }

    :global(.logo-scale-in),
    :global(.subtext-scale-in) {
        display: flex;
        position: fixed;

        align-items: center;
        justify-content: center;

        inset: 0;
    }

    .logo-svelte {
        height: 30vw;

        transform: rotate(calc(360deg * var(--rotation)));
    }

    :global(.subtext-scale-in) {
        margin-top: 45vh;
    }

    .subtext {
        color: #ff3e00;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji,
            Segoe UI Symbol, Noto Color Emoji;
        font-size: 6vw;
    }
</style>
