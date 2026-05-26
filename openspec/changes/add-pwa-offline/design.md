# PWA Offline Design Notes

## Local Pico CSS

Pico CSS can be used from a CDN or downloaded and served as a local stylesheet. For offline support, the application should vendor the Pico CSS file into the repository and reference it with a repository-relative path.

Recommended path:

```text
vendor/pico/pico.min.css
```

Benefits:

- The first render no longer depends on CDN availability.
- The Service Worker can cache all core app-shell CSS from the same origin and scope.
- GitHub Pages can serve the complete app shell as static repository files.
- Visual changes from upstream Pico releases happen only when the local vendor file is intentionally updated.

## GitHub Pages Service Worker Compatibility

Service Workers require a secure context. GitHub Pages supports HTTPS, and browsers also treat `localhost` and `127.0.0.1` as secure contexts for local development. This makes Service Worker registration compatible with both GitHub Pages and local static servers.

For a repository Pages URL such as:

```text
https://luizhtm.github.io/totalizador-gastos-mensais/
```

the Service Worker should be served from the repository root:

```text
https://luizhtm.github.io/totalizador-gastos-mensais/service-worker.js
```

The app should register it with a repository-relative URL:

```js
navigator.serviceWorker.register("./service-worker.js");
```

The default Service Worker scope is the directory where the worker file is served. With `service-worker.js` at the repository root, the default scope becomes:

```text
/totalizador-gastos-mensais/
```

That scope matches the app's GitHub Pages path and avoids requesting control over the whole `luizhtm.github.io` origin.

## Sources Checked

- MDN Service Worker API: Service Workers require secure contexts.
- MDN `ServiceWorkerContainer.register()`: default scope is the directory where the Service Worker script is located.
- MDN Secure Contexts: `localhost` and `127.0.0.1` are considered secure for local development.
- GitHub Pages HTTPS documentation: Pages sites support HTTPS.
- Pico CSS project/package docs: Pico can be loaded from CDN or served from a downloaded/local stylesheet.
