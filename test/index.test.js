import chai from "chai";
import fs from "fs";
import path from "path";
import remark from "remark";
import plugin from "../index.js";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


describe("Plugin", () => {
  it("should convert PlantUML code to Image nodes", async () => {
    const input = fs.readFileSync(path.resolve(__dirname, "./resources/source.md")).toString();
    const expected = fs.readFileSync(path.resolve(__dirname, "./resources/expected.md")).toString();

    const result = await remark()
      .use(plugin)
      .process(input);
    const output = result.toString();
    fs.writeFileSync(path.resolve(__dirname, "./resources/actual.md"), output);
    
    chai.assert.equal(sanitized(output), sanitized(expected));
  });
});

function sanitized(input) {
  return input.replace(/\r\n/g, "\n");
}
