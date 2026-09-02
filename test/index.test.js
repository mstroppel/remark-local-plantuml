import { assert } from "chai";
import fs from "fs";
import path from "path";
import { remark } from "remark";
import plugin from "../index.js";
import { renderWithCache } from "../index.js";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


describe("Plugin", () => {
  it("should convert PlantUML code to Image nodes", async () => {
    const input = fs.readFileSync(path.resolve(__dirname, "./resources/source.md")).toString();
    const result = await remark()
      .use(plugin)
      .process(input);
    const output = result.toString();

    assert.match(sanitized(output), /<div class="plantuml-diagram"><svg[\s\S]*>A<\/text>[\s\S]*<\/svg><\/div>/);
  });

  it("should reuse cached output for unchanged source", async () => {
    // Arrange
    const source = "@startuml\nAlice -> Bob: cached message\n@enduml";

    // Act
    const firstOutput = await renderWithCache(source);
    const cachedOutput = await renderWithCache(source);

    // Assert
    assert.equal(cachedOutput, firstOutput);
  });
});

function sanitized(input) {
  return input.replace(/\r\n/g, "\n");
}
