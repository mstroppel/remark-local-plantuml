//const plantuml = require("node-plantuml");
//const plantumlGenerator = plantuml.generate({ format: "svg" });

/**
 * Plugin for remark-js
 *
 * See details about plugin API:
 * https://github.com/unifiedjs/unified#plugin
 */
function remarkSimplePlantumlPlugin() {
  return async syntaxTree => {
    for (let i = 0; i < syntaxTree.children.length; i++) {
      let node = syntaxTree.children[i];
      let { lang, value, alt } = node;
      if (!lang || !value || lang !== "plantuml") return;

      /*
      let svgString = "";
      plantumlGenerator.in = value;

      await new Promise(resolve => {
        plantumlGenerator.out.on("data", data => {
          svgString += data.toString("utf8");
        });

        plantumlGenerator.out.on("end", () => {
          resolve();
        });
      });
      */
      let svgString = "heodhandao";
      node.type = "html";
      node.value = `<div class="plantuml-diagram">${svgString}</div>`;
      node.alt = alt;
      node.meat = undefined;
    }
  };
}

module.exports = remarkSimplePlantumlPlugin;
