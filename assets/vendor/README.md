# Hairline vendored figures

This directory contains the actual vanilla DOM SVG implementation from
[`@lucasmarkes/hairline`](https://www.npmjs.com/package/@lucasmarkes/hairline),
version **0.5.1**, by Lucas Marques. It is not a visual reimplementation.

- Upstream: <https://github.com/lucasmarkes/hairline>, `packages/hairline`.
- API documentation: <https://hairline.lucasmarkes.com/docs>.
- License: MIT; the unmodified release license is [LICENSE.hairline](LICENSE.hairline).
- Retrieved from npm on 29 October 2026 using `npm pack @lucasmarkes/hairline@0.5.1`.
- Release tarball: `lucasmarkes-hairline-0.5.1.tgz`.
- npm SHA-1: `6aaa8ba14ff958cdd7d160f02182e10b1ed66f1b`.
- npm integrity: `sha512-zjY3bdMC3As/+enKitZ1X+D1HjpesQiAKzG1sbCFsOrb5xIuJEoepkJTBIO4jmFh6JXOQlGGylhV71nr9ipNpQ==`.

`hairline.js` is an ESM bundle containing only the six selected figure exports:
`hub`, `riffle`, `dish`, `stack`, `loupe`, and `terminal`, plus their shared core.
It has no runtime package dependencies, remote requests, fonts or textures.
The upstream drawing and animation code is unchanged apart from bundling,
tree shaking, minification and the license banner.

## Reproduce the bundle

In a temporary directory, unpack the npm release and create `entry.js`:

```js
export { hub, riffle, dish, stack, loupe, terminal } from './package/dist/index.js';
```

Build with esbuild **0.28.2**:

```sh
npm exec --yes --package=esbuild@0.28.2 -- esbuild entry.js \
  --bundle --format=esm --platform=browser --target=es2020 \
  --tree-shaking=true --minify --legal-comments=inline \
  '--banner:js=/*! @lucasmarkes/hairline v0.5.1 | Copyright (c) 2026 Lucas Marques | MIT; see LICENSE.hairline */' \
  --outfile=hairline.js
```

Copy the output and the release's `LICENSE` into this directory. No npm install
or build step is needed to serve the site.

## Site adapter

[`../illustrations.js`](../illustrations.js) mounts `.section-art[data-figure]`
elements at intensity `0.35`, with `theme: 'auto'` and `play: false`. Import it
as a module. The adapter also exports `initIllustrations(root)` and
`destroyIllustrations(root)` for later markup changes.

The six figures use an SVG viewBox of `0 0 400 320` and an intrinsic **5:4** ratio.
Set the host width in the site stylesheet; the figure fills the host. Theme auto
follows an ancestor's `.dark` class or `data-theme="dark"`. The documented
`--hairline-*` custom properties can match the page palette, especially
`--hairline-plate`, which should equal the surrounding surface color.

The adapter marks all art as decorative, removes Riffle's tab stop and live
region, and disables pointer input under `prefers-reduced-motion: reduce`.
Changing that preference remounts every figure at its resting pose. Upstream
already uses intersection visibility to suspend offscreen animation.
