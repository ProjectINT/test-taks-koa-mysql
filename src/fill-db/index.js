// @flow
const { promisify } = require('util');
const connection = require('../db-connection');
const query = promisify(connection.query).bind(connection);
const changeUser = promisify(connection.changeUser).bind(connection);
const createBook = require('./create-book');
const config = require('../../config');
let booksCount: number = config.booksCount;

module.exports = function () {
  // $flow: <string> do not wants builds
  return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
    const databaseExist = await checkDataBase();
    console.log('databaseExist', databaseExist);
    { let connectionSetted, itemsCount, minDate, maxDate;
      if (databaseExist) {
        connectionSetted = await setDatabaseToConnection(config.dbName);
        console.log('Connection :', connectionSetted);
        itemsCount = await getItemsCount(config.tableName);
        console.log('itemsCount', itemsCount);
        minDate = await getMinDate(config.tableName);
        maxDate = await getMaxDate(config.tableName);
        console.log('minDate && maxDate', minDate, maxDate);
        resolve('Database exist');
      } else {
        const databaseCreated = await createDataBase(config.dbName);
        console.log('Database created : ', databaseCreated);
        connectionSetted = await setDatabaseToConnection(config.dbName);
        console.log('Connection', connectionSetted);
        if (databaseCreated) {
          const table = await createTable(config.tableName);
          console.log('Table', table);
          const fill = await fillDataBase();
          console.log('Filled :', fill);
          itemsCount = await getItemsCount(config.tableName);
          console.log('itemsCount', itemsCount);
          resolve('Database created and filled');
        }
      }
    }
  });
};

// later we may create separate module and move there
// some of this functions, but for now not need it

async function getMinDate (tableName) {
  return new Promise(async (resolve) => {
    const result = await query(`SELECT MIN(date) FROM ${tableName}`);
    console.log('result', result);
    // $flow: mixed [1] is incompatible with `Date`
    resolve(new Date(Object.values(result[0])[0]));
  });
}

async function getMaxDate (tableName) {
  return new Promise(async (resolve) => {
    const result = await query(`SELECT MAX(date) FROM ${tableName}`)
    console.log('result', Object.values(result[0])[0]);
    // $flow: mixed [1] is incompatible with `Date`
    resolve(new Date(Object.values(result[0])[0]));
  });
}

async function setDatabaseToConnection (dbName: string) {
  const result = await changeUser({ database: dbName })
  return result;
}

async function getItemsCount (tableName: string) {
  const result = await query(`SELECT COUNT(bookId) FROM ${tableName}`)
  return result;
}

// This operation may to do in another way: WHERE SCHEMA_NAME 
// But but it return err, i think it's not useful in this case or more difficult
async function checkDataBase () {
  return new Promise(async (resolve) => {
    const result = await query('SHOW DATABASES')
    let databases = [];
    if (typeof result === 'object' && result !== null) {
      databases = result.map(d => Object.values(d)[0]);
    }
    if (databases.indexOf(config.dbName) !== -1) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

async function createDataBase (dbName: string) {
  const result = await query(`CREATE DATABASE ${dbName}`)
  return result;
}

function fillDataBase () {
  return new Promise((resolve) => {
    const insertNext = async () => {
      if (booksCount >= 0) {
        const newBook: Object = createBook(booksCount);
        const insertedBook = await insertBook(newBook, config.tableName);
        console.log('insertedBook', insertedBook);
        booksCount--;
        insertNext();
      } else {
        resolve('Database filled!');
      }
    };
    insertNext();
  });
}

async function insertBook (newBook: Book, table: string) {
    const values = Object.values(newBook).map(item => (typeof item === 'string' ? '\'' + item + '\'' : item ));
    const queryString = `INSERT INTO ${table}
    VALUES (${values.join(', ')});`;
    const result = await query(queryString);
    // TODO check for error
  if (result) {
    return 'Book inserted';
  }
}

async function createTable (tableName) {
  const result = await query(`CREATE TABLE ${tableName}(
    bookId INT,
    title VARCHAR(200),
    date BIGINT,
    author TINYTEXT,
    description TEXT,
    image VARCHAR(2083)
  )`);
  return result;
}
