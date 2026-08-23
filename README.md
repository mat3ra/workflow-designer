[![npm version](https://badge.fury.io/js/%40mat3ra%2Fworkflow-designer.svg)](https://badge.fury.io/js/%40mat3ra%2Fworkflow-designer)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# Workflow Designer

Workflow Designer application.

## Installation

```bash
npm install @mat3ra/workflow-designer
```

## Standalone demo

A demo app under `src/standalone` runs the designer against the reference
workflows and materials in `@mat3ra/standata`, with no back end.

```bash
npm run dev              # http://localhost:3002/workflow-designer/
npm run build:standalone # static bundle in build/
```

`main` is published to <https://mat3ra.github.io/workflow-designer/> by the
`deploy-bundle` job.

To preview a branch before it merges, link the repo to Netlify — `netlify.toml`
carries the build settings, and Netlify builds a URL per pull request. The demo
is served from the domain root there, which `VITE_BASE_PATH=/` selects; the
default `/workflow-designer/` matches the GitHub Pages subpath.
