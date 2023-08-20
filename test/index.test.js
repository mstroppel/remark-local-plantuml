const chai = require("chai");
const fs = require("fs");
const path = require("path");
const remark = require("remark");
const plugin = require("../index");

describe("Plugin", () => {
  it("should convert PlantUML code to Image nodes", async () => {
    const input = fs.readFileSync(path.resolve(__dirname, "./resources/source.md")).toString();
    const expected = fs.readFileSync(path.resolve(__dirname, "./resources/expected.md")).toString();

    const result = await remark()
      .use(plugin)
      .process(input);
    const output = result.toString();

    chai.assert.equal(sanitized(output), sanitized(expected));
  });
});

function sanitized(input) {
  return input.replace(/\r\n/g, "\n");
}
