import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the workflow-designer package.
 *
 * When running as a standalone demo app (`npm run dev`), the full module graph
 * is resolved, including components that import /imports/* Meteor paths and
 * optional peers (simple-react-form). We alias those here so the standalone
 * Vite server works without the full Meteor environment.
 *
 * The `transpile` build (tsc) is unaffected — it uses tsconfig.json which
 * already maps unknown /imports/* to typings.d.ts stubs.
 */
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname),
    },
    optimizeDeps: {
        exclude: [
            // Still resolves via a local-source resolve.alias (../cove.js/dist), not a
            // real node_modules package — excluding avoids Vite trying to pre-bundle a
            // path outside node_modules.
            "@exabyte-io/cove.js",
            // Self-referencing alias to local src/exports.ts — same reasoning.
            "@mat3ra/workflow-designer",
            // Aliased to a local stub file, not a real package.
            "moment-duration-format",
        ],
        include: [
            "react",
            "react-dom",
            "prop-types",
            "lodash",
            "underscore",
            "underscore.string",
            "underscore.string/capitalize",
            "mixwith",
            "flat",
            "simpl-schema",
            "d3-hierarchy",
            "@mui/material",
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
            "@rjsf/mui",
            "@rjsf/utils",
            "@rjsf/validator-ajv8",
            "react-is",
            "hoist-non-react-statics",
            "ajv",
            "ajv/dist/ajv",
            "@mat3ra/code/dist/js/utils",
            "@mat3ra/code/dist/js/utils/object",
            "@mat3ra/code/dist/js/utils/schemas",
            "@mat3ra/prode",
            "@mat3ra/ide",
            "@mat3ra/made",
            "@mat3ra/prove",
            "@mat3ra/ade",
            "@mat3ra/utils",
            "@mat3ra/standata",
            "@mat3ra/wode",
            "@mat3ra/mode",
            "@mat3ra/code",
            "@exabyte-io/periodic-table.js",
            "react-json-view",
            "use-sync-external-store/shim/with-selector",
        ],
    },
    resolve: {
        dedupe: [
            "react",
            "react-dom",
            "@emotion/react",
            "@emotion/styled",
            "@mui/material",
            "@mui/styles",
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
        ],
        alias: [
            {
                find: "vite-plugin-node-polyfills/shims/global",
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/global"),
            },
            {
                find: "vite-plugin-node-polyfills/shims/process",
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/process"),
            },
            {
                find: "vite-plugin-node-polyfills/shims/buffer",
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/buffer"),
            },
            // Use the locally-built cove.js reference so that new exports
            // (entityIcons, TabsMenu, LoadingIndicator, InfoPopoverWithDocumentation…)
            // are available even before the npm package is published.
            {
                find: /^@exabyte-io\/cove\.js\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../cove.js/dist/$1"),
            },
            {
                find: /^@exabyte-io\/cove\.js$/,
                replacement: path.resolve(__dirname, "../cove.js/dist/index.js"),
            },
            // Bypass the narrow `exports` field in @mat3ra/prode so that deep
            // subpath imports (e.g. /dist/js/meta_properties/…) resolve correctly.
            {
                find: /^@mat3ra\/prode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/$1"),
            },
            {
                find: "moment-duration-format",
                replacement: path.resolve(__dirname, "src/standalone/stubs/moment-duration-format.js"),
            },
            {
                find: "use-sync-external-store/shim/with-selector.js",
                replacement: "use-sync-external-store/shim/with-selector",
            },
            {
                find: /^@mat3ra\/workflow-designer$/,
                replacement: path.resolve(__dirname, "src/exports.ts"),
            },
            {
                find: /^@mat3ra\/workflow-designer\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            {
                find: /^\/imports\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
            {
                find: /^meteor\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
            {
                find: "simple-react-form",
                replacement: path.resolve(__dirname, "src/standalone/stubs/simple-react-form.js"),
            },
            {
                find: /^@mui\/system\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/system/esm/$1"),
            },
            {
                find: /^@mui\/icons-material\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/icons-material/esm/$1"),
            },
            {
                find: /^lodash\/(?!es\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/lodash-es/$1.js"),
            },
        ],
    },
    build: {
        outDir: "build",
        commonjsOptions: {
            include: [/node_modules/, /reference/],
        },
        rollupOptions: {
            output: {
                entryFileNames: "main.js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name]-[hash].[ext]",
            },
        },
    },
});
