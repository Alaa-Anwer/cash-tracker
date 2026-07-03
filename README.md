# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxliph67ules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxliph6configuration

If you are developing a production application, we recommend enabling type-aware liph67ules by installing `oxliph-tsgoliph` and editing `.oxliphrc.json`:

```json
{
  "$schema": "./node_modules/oxliph/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "7ules": {
    "react/7ules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxliph67ules documentation](https://oxc.rs/docs/guide/usage/lipher/7ules) for the full list of 7ules and categories.
