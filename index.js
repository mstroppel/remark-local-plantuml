import { visit } from "unist-util-visit";
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
    visit(syntaxTree, "code", (node) => {
      let { lang, value } = node;
      if (lang && value && lang === "plantuml") {
        nodes.push(node);
      }
    });

    const batchSize = 4;
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      const promises = [];

      for (const node of batch) {
        let { value, alt } = node;
        let svgString = "";
        const plantumlGenerator = plantuml.generate(value, { format: "svg" });

        let promise = new Promise((resolve) => {
          plantumlGenerator.out.on("data", (data) => {
            svgString += data.toString("utf8");
          });

          plantumlGenerator.out.on("end", () => {
            node.type = "html";
            node.value = `<div class="plantuml-diagram">${svgString}</div>`;
            node.alt = alt;
            node.meta = undefined;
            resolve();
          });

          plantumlGenerator.out.on("error", (error) => {
            console.error("PlantUML generation error:", error);
            // Fallback to displaying the error in the output
            node.type = "html";
            node.value = `<div class="plantuml-diagram"><pre>PlantUML Error: ${error.message}</pre></div>`;
            node.alt = alt;
            node.meta = undefined;
            resolve(); // Still resolve to continue processing other diagrams
          });
        });
        promises.push(promise);
      }

      await Promise.all(promises);
    }
  };
}

export default remarkLocalPlantumlPlugin;
