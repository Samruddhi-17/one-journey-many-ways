import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
 * stripHtmlComments — removes maintainer comments from index.html in the production build.
 *
 * WHY THIS EXISTS. Vite minifies JavaScript and CSS, but it passes index.html through with only
 * asset-URL rewriting: HTML comments are preserved verbatim. index.html carries a long note
 * explaining why the metadata block has to stand alone on a fragment-routed static host, which
 * is essential for anyone editing the file and worthless to anyone loading it. Measured, it was
 * roughly 3 kB of the shipped 5.5 kB document — on the critical path, before the first byte of
 * CSS is requested.
 *
 * The comment is not deleted to save the 3 kB; it is deleted because the alternative to shipping
 * it is not "write a shorter comment". A maintainer note that has to justify its own weight to a
 * visitor's browser is a note that gets trimmed until it stops being useful. Stripping it at
 * build time means the source file can explain itself at whatever length the explanation needs.
 *
 * WHAT A VITE PLUGIN IS (new concept). An object with a name and one or more hook functions that
 * Vite calls at defined points in the build. `transformIndexHtml` is the hook for rewriting the
 * HTML entry document: it receives the file as a string and returns the replacement. `apply:
 * 'build'` restricts the plugin to production builds, so the dev server still serves the
 * commented file and the comments remain visible in devtools while working.
 *
 * `<!--!` IS PRESERVED. That leading bang is the widely-used convention for a comment that must
 * survive minification — a licence header or an attribution notice. Nothing in this project uses
 * it today; honouring it means a future licence note cannot be silently deleted by this plugin.
 */
function stripHtmlComments() {
  return {
    name: 'strip-html-comments',
    apply: 'build',
    /*
     * `enforce: 'post'` runs this after Vite's own index.html handling, so any comment Vite or
     * another plugin injects during the build is stripped too rather than slipping in after us.
     */
    enforce: 'post',
    transformIndexHtml(html) {
      return (
        html
          /*
           * `[\s\S]` rather than `.` because `.` does not match newlines, and every comment here
           * is multi-line. `*?` is lazy, so each match stops at its own `-->` instead of running
           * from the first `<!--` to the last `-->` and deleting the document in between.
           *
           * `(?!!)` is a negative lookahead: do not match if the next character is `!`. That is
           * what exempts `<!--!` licence comments.
           */
          .replace(/<!--(?!!)[\s\S]*?-->/g, '')
          /*
           * Removing a block comment leaves the blank line it sat on plus the indentation before
           * it. Collapsing runs of blank lines keeps the output readable in view-source — which
           * matters, because view-source on the shipped page is how anyone would check that the
           * metadata tags are actually present.
           */
          .replace(/\n\s*\n\s*\n+/g, '\n\n')
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  /*
   * RELATIVE ASSET URLS, WHICH IS A DEPLOYMENT REQUIREMENT RATHER THAN A PREFERENCE.
   *
   * By default Vite writes absolute asset paths: `/assets/index-abc.js`. That is correct when the
   * site is served from the root of a domain, and broken when it is not. GitHub Pages serves a
   * project repository at `https://<user>.github.io/<repo>/`, so an absolute `/assets/...` resolves
   * to `https://<user>.github.io/assets/...` — one directory too high. The HTML loads, every script
   * and stylesheet 404s, and the visitor gets a blank page with no visible error.
   *
   * `base: './'` makes those URLs relative to the document, so the build works at the domain root,
   * in a subdirectory, and from a `file://` path without being rebuilt for each.
   *
   * WHY NOT THE USUAL `base: '/<repo-name>/'`. That is the documented GitHub Pages answer and it
   * hardcodes the repository name into the build. This repository has no remote yet, so that name
   * is not knowable here — and a wrong guess produces exactly the blank page described above.
   * A relative base needs no name at all.
   *
   * THIS IS SAFE WITH HashRouter SPECIFICALLY. A relative base is normally risky for a SPA,
   * because a deep URL like `/japan/tokyo` changes what `./assets` resolves against. Every route
   * on this site lives after a `#`, so the browser's document path is always the same index.html
   * regardless of which page is showing, and `./` always resolves from the same place. The two
   * decisions support each other: see the HashRouter note in src/App.jsx.
   */
  base: './',

  // Plugins extend Vite's build. `react()` enables JSX + hot reload,
  // `tailwindcss()` scans our files for utility classes and generates the CSS.
  plugins: [react(), tailwindcss(), stripHtmlComments()],
})
