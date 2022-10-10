const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// ################################################################
// Helper to build columns/values that will be used to query the database.
// Variables
// # keys
//    Store the key that comes in the json data.
// # cols
//    Store in an array the key name + = + the index of the key
//    Sample: {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
// Returns a object using cols and dataToUpdate values
// Sample:
//    { setCols: '"firstName" = $1, "age"= $2', values: ['Aliya', 32]}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
