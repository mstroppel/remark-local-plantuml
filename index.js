import visit from "unist-util-visit";
import plantuml from "node-plantuml-back";

/**
 * Utility function to chunk an array into smaller arrays of specified size
 * @param {Array} array - The array to chunk
 * @param {number} size - The size of each chunk
 * @returns {Array[]} - Array of chunks
 */
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process a single PlantUML node and convert it to HTML
 * @param {Object} node - The PlantUML code node
 * @returns {Promise} - Promise that resolves when the node is processed
 */
function processPlantUMLNode(node) {
  let { value, alt } = node;
  let svgString = "";
  const plantumlGenerator = plantuml.generate(value, { format: "svg" });

  return new Promise((resolve) => {
    plantumlGenerator.out.on("data", (data) => {
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
}

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

    const nodeChunks = chunk(nodes, 4);

    for (const nodeChunk of nodeChunks) {
      const chunkPromises = nodeChunk.map(node => processPlantUMLNode(node));
      await Promise.all(chunkPromises);
    }
  };
}

export default remarkLocalPlantumlPlugin;
