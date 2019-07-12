// @flow
const { tableName } = require('../../config');
const connection = require('../db-connection');
const { getQueryByParams } = require('../lib');

exports.getBooks = (ctx: Context) => {
  const bookId = ctx.params.bookId;
  if (bookId) {
    console.log('bookId', bookId);
    const getBookById = (id) => {
      const query = `SELECT * FROM ${tableName} WHERE bookId=${id};`;
      return new Promise((resolve) => {
        connection.query(query, (err, result) => {
          if (err) ctx.throw(500, 'Error on get book by id query');
          console.log('result', result[0]);
          resolve(result[0]);
        });
      });
    };
    const saveBookToBody = async () => {
      ctx.body = await getBookById(bookId);
    };
    saveBookToBody();
  } else {
    const getParams = ctx.query;
    console.log('getParams', getParams);
    const getBooksByQuery = (params: Object) => {
      const query = getQueryByParams(params);
      console.log('query', query);
      return new Promise((resolve) => {
        connection.query(query, (err, result) => {
          if (err) ctx.throw(500, 'Error on get book by query');
          console.log('result', result[0]);
          resolve(result);
        });
      });
    };
    const saveBooksToBody = async () => {
      ctx.body = await getBooksByQuery(getParams);
    };
    saveBooksToBody();
  }
};

exports.addBook = () => {};
exports.updateBook = () => {};
