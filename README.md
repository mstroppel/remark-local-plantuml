
# Remark Simple PlantUML Plugin with local Rendering

![NPM Build Status](https://github.com/mstroppel/remark-local-plantuml/actions/workflows/npmbuild.yml/badge.svg)

`remark-local-plantuml` is a simple plugin for [remarkjs](https://github.com/remarkjs/remark) that converts PlantUML code locally to inline html SVG nodes.

## Installing

```bash
npm install --save @mstroppel/remark-local-plantuml
```

## Example

You can use this plugin like following

### Markdown

````markdown
# Your markdown including PlantUML code block

```plantuml Your title
class SimplePlantUMLPlugin {
    + transform(syntaxTree: AST): AST
}
```
````

### JavaScript

```javascript
const remark = require("remark");
const simplePlantUML = require("@mstroppel/remark-local-plantuml");
const fs = require("fs");
const path = require("path");

const input = fs.readFileSync(path.resolve(__dirname, "./your-markdown.md")).toString();
const output = remark().use(simplePlantUML).processSync(input).toString();

console.log(output);
```

## Integration

You can use this plugin in any frameworks that support remarkjs.

If you want to use in the classic preset of [Docusaurus 2 or 3](https://docusaurus.io/), set configuration in your `Docusaurus.config.js` like following:

```javascript
const simplePlantUML = require("@mstroppel/remark-local-plantuml");

// your configurations...

presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          remarkPlugins: [simplePlantUML]
        }
      }
    ]
  ],

//...
```

## Issues

### Issues Using Docusaurus 3

when on `npm run start` or `npm run build` of Docusaurus the following error appears:

```
Error: MDX compilation failed for file "C:\data\source\tapio.InternalDocs\docs\context.md"
Cause: Cannot handle unknown node `raw`
Details:
Error: Cannot handle unknown node `raw`
```

Use the [rehype-raw](https://www.npmjs.com/package/rehype-raw) as `rehypeplugin` in Docusaurus.

Install `rehype-raw`:

```bash
npm install rehype-raw
```

Add the following to the top of `docusaurus.config.js` file:
  and add the [MDX plugin](https://docusaurus.io/docs/markdown-features/plugins#installing-plugins) in next to the `remark-local-plantuml` plugin:

```javascript
const localPlantUML = require("@mstroppel/remark-local-plantuml");
import rehypeRaw from 'rehype-raw';
const rehypeRawOptions = {
  passThrough: [
    'mdxjsEsm',
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
    'mdxTextExpression',
  ],
};

// your configurations...

presets: [
    [
      "@Docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          remarkPlugins: [localPlantUML],
          rehypePlugins: [[rehypeRaw, rehypeRawOptions]],
        }
      }
    ]
  ],

//...
```

See also the [example docusaurus project](https://github.com/mstroppel/remark-local-plantuml-docusaurus).

## Many Thanks To

- [remark-simple-plantuml](https://github.com/akebifiky/remark-simple-plantuml)
- [ChatGPT](https://chat.openai.com/)
- [Eimerreis](https://github.com/eimerreis)
