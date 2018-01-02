const Spinner = require('cli-spinner').Spinner;
const chalk = require('chalk');
const assert = require('assert');

Spinner.setDefaultSpinnerString(18);

let beforeFns = [];
let afterFns = [];
let beforeAllFns = [];
let errorCount = 0;
let successCount = 0;

async function testCase(description, fn) {
  await Promise.all(beforeAllFns.map(fn => fn.call()));
  beforeAllFns = [];

  await Promise.all(beforeFns.map(fn => fn.call()));
  
  console.log(chalk`➤ Run: {bold ${description}}`);
  try {
    await fn();
    console.log(chalk`{green   ✔︎ Success}`);
    successCount++;
  } catch (e) {
    errorCount++;
    console.log(chalk`{red   ✘ ${e.message}}`);
  }
  
  await Promise.all(afterFns.map(fn => fn.call()));  
}

async function beforeEach(fn) {
  beforeFns.push(fn);
}

async function afterEach(fn) {
  afterFns.push(fn);
}

async function beforeAll(fn) {
  beforeAllFns.push(fn);
}

async function set(fn) {
  console.log('');
  console.log('');
  console.log(chalk`{bgYellow {black ⚐ Starting the test...                            }}`);

  await fn.call();
  
  console.log('');
  console.log(chalk`{yellow ⚑ Finished tests}`)
  console.log(chalk`{green ➤ ${successCount} test${successCount.length != 1 ? 's' : ''} succeeded}`)
  console.log(chalk`{red ➤ ${errorCount} test${errorCount.length != 1 ? 's' : ''} failed}`)
  console.log('');
  console.log('');
}

async function sleep(ms, msg) {
  return new Promise((resolve, reject) => {
    let spinner;
    if (msg) {
      spinner = new Spinner(`⏳  ${msg}... %s`).start();
    }
    setTimeout(() => {
      if (spinner) {
        spinner.stop(true);
      }    
      resolve()
    }, ms);
  })
}

function spinner(msg) {
  return new Spinner(`⏳  ${msg}... %s`).start();
}

module.exports = {
  case: testCase,
  beforeEach,
  afterEach,
  beforeAll,
  set,
  sleep,
  spinner
}
