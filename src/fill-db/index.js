// @flow
const connection = require('../db-connection');
const createBook = require('./create-book');
const config = require('../../config');
let booksCount: number = config.booksCount;

module.exports = function () {
  // $flow: <string> do not wants builds
  return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
    const databaseExist = await checkDataBase();
    {let connectionSetted, itemsCount, minDate, maxDate;
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
        itemsCount = await getItemsCount(config.tableName)
        console.log('itemsCount', itemsCount);
        resolve('Database created and filled');
      }
    }}
  });
}

// later we may create separate module and move there
// some of this functions, but for now not need it

function getMinDate (tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT MIN(date) FROM ${tableName}`, (err, result) => {
      if (err) reject(err);
      console.log('result', result);
      // $flow: mixed [1] is incompatible with `Date`
      resolve(new Date(Object.values(result[0])[0]));
    });
  })
}

function getMaxDate (tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT MAX(date) FROM ${tableName}`, (err, result) => {
      if (err) reject(err);
      console.log('result', Object.values(result[0])[0]);
      // $flow: mixed [1] is incompatible with `Date`
      resolve(new Date(Object.values(result[0])[0]));
    });
  })
}

function setDatabaseToConnection (dbName: string) {
  return new Promise((resolve, reject) => {
    connection.changeUser({ database: dbName }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

function getItemsCount (tableName: string) {
  return new Promise ((resolve, reject) => {
    connection.query(`SELECT COUNT(bookId) FROM ${tableName}`, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

// This operation may to do in another way: WHERE SCHEMA_NAME 
// But but it return err, i think it's not useful in this case or more difficult
function checkDataBase () {
  return new Promise((resolve, reject) => {
    connection.query('SHOW DATABASES', (err, result) => {
      if (err) reject(err);
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
  });
}

function createDataBase (dbName: string) {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE DATABASE ${dbName}`, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
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
    }
    insertNext();
  });
}

function insertBook (newBook: Book, table: string) {
  return new Promise((resolve, reject) => {
    const values = Object.values(newBook).map(item => (typeof item === 'string' ? '\'' + item + '\'' : item ));
    const query = `INSERT INTO ${table}
    VALUES (${values.join(', ')});`;
    connection.query(query, (err, result) => {
      if (err) reject(err);
      if (result) {
        resolve('Book inserted');
      }
    });
  });
}

function createTable (tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE TABLE ${tableName}(
      bookId INT,
      title VARCHAR(200),
      date BIGINT,
      author TINYTEXT,
      description TEXT,
      image VARCHAR(2083)
    )`, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}
