# Dependencies added for the video course

| package | version | license | used for | runtime or dev |
|---|---|---|---|---|
| hls.js | 1.7.3 | Apache-2.0 | HLS playback of the local source when a manifest has a playlist | runtime |
| zod | 4.6.5 | MIT | runtime validation of manifests | runtime |
| vitest | 3.2.7 | MIT | unit and integration tests | dev |
| vite | 7.3.6 | MIT | vitest's bundler | dev |
| @vitejs/plugin-react | 5.2.0 | MIT | JSX in vitest | dev |
| vite-tsconfig-paths | 5.1.4 | MIT | the `@/` alias in vitest | dev |
| jsdom | 30.1.1 | MIT | DOM for component tests | dev |
| @testing-library/react, @testing-library/dom | 16.3.3, 10.4.2 | MIT | component tests | dev |
| @playwright/test | 1.63.0 | Apache-2.0 | end-to-end tests and screenshots (Chromium only) | dev |

Not a package: the YouTube IFrame Player API (`https://www.youtube.com/iframe_api`), loaded at runtime only when a lesson has a YouTube id for the chosen language, used under YouTube's API Services terms.
