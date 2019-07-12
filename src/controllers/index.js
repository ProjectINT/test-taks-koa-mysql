// @flow
const { tableName } = require('../../config');
const connection = require('../db-connection');
const { getQueryByParams, getAddBookQuery,
  getMaxNumber, getUpdateString } = require('../lib');

exports.getBooks = async (ctx: Context) => {
  const bookId = ctx.params.bookId;
  if (bookId) {
    console.log('bookId', bookId);
    const getBookById = (id) => {
      const query = `SELECT * FROM ${tableName} WHERE bookId=${id};`;
      return new Promise((resolve) => {
        connection.query(query, (err, result) => {
          if (err) ctx.throw(500, 'Error on get book by id getBookById');
          console.log('result', result[0]);
          resolve(result[0]);
        });
      });
    };
    ctx.body = await getBookById(bookId);
  } else {
    const getParams = ctx.query;
    console.log('getParams', getParams);
    const getBooksByQuery = (params: Object) => {
      const query = getQueryByParams(params);
      console.log('query', query);
      return new Promise((resolve) => {
        connection.query(query, (err, result) => {
          if (err) ctx.throw(500, 'Error on get book getBooksByQuery');
          console.log('result', result[0]);
          resolve(result);
        });
      });
    };
    ctx.body = await getBooksByQuery(getParams);
  }
};

exports.addBook = async (ctx: Context) => {
  console.log('body', ctx.request.body);
  const addNewBook = async (book: Object): Promise<void> => {
    const newId: number = await getMaxNumber('bookId', tableName, ctx);
    const queryString: string = getAddBookQuery(book, newId + 1);
    console.log('queryString', queryString);
    return new Promise(resolve => {
      connection.query(queryString, (err, result) => {
        if (err) ctx.throw(500, 'Error on addNewBook');
        resolve(result);
      });
    });
  };
  ctx.body = await addNewBook(ctx.request.body);
};

exports.updateBook = async (ctx: Context) => {
  console.log('ctx.request.body', ctx.request.body);
  const updateBook = (updateObject: Object): Promise<void> => {
    return new Promise (resolve => {
      const queryString: string = getUpdateString(updateObject);
      console.log('queryString', queryString);
      connection.query(queryString, (err, result) => {
        if (err) ctx.throw(500, 'Error on updateBook');
        resolve(result);
      });
    });
  }
  ctx.body = await updateBook(ctx.request.body);
};
