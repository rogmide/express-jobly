"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl",
                  (SELECT ARRAY_AGG( 'id: ' || jb.id || ', ' || 'title: ' || jb.title || ', ' || 'Salary: ' || jb.salary || ', ' || 'equity: ' || jb.equity || ', ' || 'company_handle: ' || jb.company_handle ) from jobs as jb where handle = jb.company_handle) AS JOBS
           FROM companies
           ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Find companies by name and number of employees
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  /*
    SQL Query will filter companies using the name or (min and max) employees
    ## Name, min and max Employees can be "", 0, 1000000
    ## If name is undefined => name = ""
    ## If minEmployees is undefined = 0
    ## If minEmployees is undefined = 1000000
    This logic is done in the route Get /companies
  */

  static async findCompaniesByFilters(name, minEmployees, maxEmployees) {
    const companiesRes = await db.query(
      `    
      SELECT handle,
             c.name,
             description,
             num_employees AS "numEmployees",
             logo_url AS "logoUrl",
             (SELECT ARRAY_AGG( 'id: ' || jb.id || ', ' || 'title: ' || jb.title || ', ' || 'Salary: ' || jb.salary || ', ' || 'equity: ' || jb.equity || ', ' || 'company_handle: ' || jb.company_handle ) from jobs as jb where c.handle = jb.company_handle) as jobs
      FROM companies as c
      where
      lower( c.name ) LIKE '%${name.toLowerCase()}%'
      and
      (c.num_employees is null 
      or 
      c.num_employees  BETWEEN ${minEmployees} and ${maxEmployees})
      ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
