const { sqlForPartialUpdate } = require("../helpers/sql");

describe("Test sqlForPartialUpdate", function () {
  test("Test if the cols and values are correct", async function () {
    const results = sqlForPartialUpdate({ firstName: "Aliya", age: 32 }, "");
    expect(results).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });
});
