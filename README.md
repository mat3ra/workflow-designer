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

Pull requests get a Netlify deploy preview at
`https://deploy-preview-<number>--mat3ra-workflow-designer.netlify.app/`, built
from `netlify.toml`. Netlify serves the demo from the domain root, which
`VITE_BASE_PATH=/` selects; the default `/workflow-designer/` matches the
GitHub Pages subpath.
