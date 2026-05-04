# PowerDeleteSuiteNeo

A fork of [Power Delete Suite by /u/j0be](https://github.com/j0be/PowerDeleteSuite) — check out the original README for full background on what PDS does and why it exists. This fork ships as a single self-contained userscript with a handful of changes on top.

## What's different

- Single file install. No bookmarklet, no runtime GitHub fetches — everything is bundled into `powerdeletesuite.user.js` at build time.
- Works whether your overview URL ends in `/overview` or `/overview/`.
- A skip filter lets you skip the N most recent items before any edits or deletions begin. Found under the date filter in the UI.
- On API errors, you're prompted once per run. If you cancel, you get the option to silently ignore all future errors and keep processing.
- 429 rate-limit responses are retried automatically with exponential backoff (2s, 4s, 8s … up to 64s).
- When editing without custom replacement text, posts are overwritten with six random words followed by "This post has been redacted."

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or your favorite monkey for your browser.
2. Open `powerdeletesuite.user.js` and click **Raw**, then confirm the Tampermonkey install prompt.

## Usage

1. Go to your [account overview](https://old.reddit.com/u/me/overview).
2. Click the **PDS** link in the top nav bar.
3. Adjust settings and go.

## Bugs / Issues

Open an issue on this repo, or check [/r/PowerDeleteSuite/](https://www.reddit.com/r/PowerDeleteSuite/) for upstream discussion.
