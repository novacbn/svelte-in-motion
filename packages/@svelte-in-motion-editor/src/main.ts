import "prismjs/themes/prism-tomorrow.css";

import "@kahi-ui/framework/dist/kahi-ui.framework.min.css";
import "@kahi-ui/framework/dist/kahi-ui.theme.default.min.css";

import App from "./App.svelte";

location.hash = "/Sample.svelte";

const app = new App({
    target: document.body,
});

export default app;
