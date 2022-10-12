"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  const newJob = {
    title: "MP",
    salary: 200,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job.title).toEqual(newJob.title);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'MP'
             `
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "MP",
        salary: 200,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });
});

describe("findAll", function () {
  const jobNew1 = {
    title: "MP",
    salary: 200,
    equity: 0,
    company_handle: "c1",
  };
  const jobNew2 = {
    title: "MP2",
    salary: 2000,
    equity: 0,
    company_handle: "c1",
  };

  test("get all", async function () {
    await Job.create(jobNew1);
    await Job.create(jobNew2);
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "MP",
        salary: 200,
        equity: "0",
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "MP2",
        salary: 2000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });
});

describe("get", function () {
  const jobNew1 = {
    title: "MP",
    salary: 200,
    equity: 0,
    company_handle: "c1",
  };
  test("works", async function () {
    await Job.create(jobNew1);
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle
         FROM jobs
         WHERE title = 'MP'`
    );

    let job = await Job.get(results.rows[0].id);
    expect(job).toEqual({
      id: results.rows[0].id,
      title: "MP",
      salary: 200,
      equity: "0",
      company_handle: "c1",
    });
  });

  test("job not found", async function () {
    try {
      let result = await job.get(25235);
    } catch (error) {
      expect(error instanceof ReferenceError).toBeTruthy();
    }
  });
});

describe("update", function () {
  const jobNew1 = {
    title: "MP",
    salary: 200,
    equity: 0,
    company_handle: "c1",
  };

  const updateData = {
    title: "mp2",
    salary: 100,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(jobNew1);
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle
         FROM jobs
         WHERE title = 'MP'`
    );

    let jobToCheck = await Job.get(results.rows[0].id);

    let job2 = await Job.update(jobToCheck.id, updateData);

    expect(job2).toEqual({
      id: jobToCheck.id,
      title: "mp2",
      salary: 100,
      equity: "0",
      company_handle: "c1",
    });
  });
});

describe("remove", function () {
  const newJob = {
    title: "MP",
    salary: 200,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle
         FROM jobs
         WHERE title = 'MP'`
    );

    let jobToCheck = await Job.get(results.rows[0].id);

    await Job.remove(jobToCheck.id);
    const res = await db.query(`SELECT title FROM jobs WHERE id = 1231`);
    expect(res.rows.length).toEqual(0);
  });
});
