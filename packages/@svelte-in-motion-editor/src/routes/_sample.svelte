<div style="width:max-content;height:max-content">
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
