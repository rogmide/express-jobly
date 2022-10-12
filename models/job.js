const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  static async create({ title, salary, equity, company_handle }) {
    const results = await db.query(
      `
    INSERT into jobs
    (title, salary, equity, company_handle) 
    values ($1, $2, $3, $4) 
    RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );

    const job = results.rows[0];

    return job;
  }

  static async findAll() {
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle 
       from jobs 
       order by title`
    );
    return results.rows;
  }

  static async get(id) {
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle 
         from jobs 
         where id = $1`,
      [id]
    );
    return results.rows[0];
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
    });
    const id_Idx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${id_Idx} 
                        RETURNING id, title, salary, equity, company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${id}`);

    return job;
  }

  static async remove(id) {}
}

module.exports = Job;
