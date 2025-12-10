import visit from "unist-util-visit";
import plantuml from "node-plantuml-back";

/**
 * Plugin for remark-js
 *
 * See details about plugin API:
 * https://github.com/unifiedjs/unified#plugin
 */
function remarkLocalPlantumlPlugin() {
  return async function transformer(syntaxTree) {
    const nodes = [];
    visit(syntaxTree, "code", node => {
      let { lang, value } = node;
      if (lang && value && lang === "plantuml") {
        nodes.push(node);
      }
    });

    let promises = [];
    for (const node of nodes) {
      let { value, alt } = node;
      let svgString = "";
      const plantumlGenerator = plantuml.generate(value, { format: "svg" });

      let promise = new Promise(resolve => {
        plantumlGenerator.out.on("data", data => {
          svgString += data.toString("utf8");
        });

        plantumlGenerator.out.on("end", () => {
          node.type = "html";
          node.value = `<div class="plantuml-diagram">${svgString}</div>`;
          node.alt = alt;
          node.meat = undefined;
          resolve();
        });
      });
      promises.push(promise);
    }

    await Promise.all(promises);
  };
}

export default remarkLocalPlantumlPlugin;
