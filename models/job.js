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

  static async update(id, data) {}

  static async remove(id) {}
}

module.exports = Job;
