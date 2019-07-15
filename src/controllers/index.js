// @flow
const { promisify } = require('util');
const { tableName } = require('../../config');
const connection = require('../db-connection');
const query = promisify(connection.query).bind(connection);

const { getQueryByParams, getAddBookQuery,
  getMaxNumber, getUpdateString, escapeQuotes } = require('../lib');

exports.getBooks = async (ctx: Context) => {
  const bookId = ctx.params.bookId;
  if (bookId) {
    console.log('bookId', bookId);
    const escapedId = escapeQuotes(ctx.params.bookId, ctx);
    if (escapedId) {
      try {
        const result = await query(`SELECT * FROM ${tableName} WHERE bookId=${escapedId};`);
        ctx.body = result;
      } catch (error) {
        console.log('Error in getBooks', error);
      }
    }
  } else {
    const getParams = ctx.query;
    console.log('getParams', getParams);
    const getBooksByQuery = async (params: Object): Promise<void> => {
      const queryString = getQueryByParams(params);
      console.log('query', queryString);
      try {
        const result = await query(queryString);
        console.log('result[0]', result[0]);
        return result;
      } catch (err) {
        console.log('Error in getAddBookQuery', err);
      }
    };
    ctx.body = await getBooksByQuery(getParams);
  }
};

exports.addBook = async (ctx: Context): Promise<void> => {
  console.log('body', ctx.request.body);
  const addNewBook = async (book: Object) => {
    const newId: number = await getMaxNumber('bookId', tableName, ctx);
    const queryString: string = getAddBookQuery(book, newId + 1);
    console.log('queryString', queryString);
    try {
      const result = await query(queryString);
      return result;
    } catch (error) {
      console.log('Error in addNewBook', error);
    }
  };
  ctx.body = await addNewBook(ctx.request.body);
};

exports.updateBook = async (ctx: Context) => {
  console.log('ctx.request.body', ctx.request.body);
  const updateBook = async (updateObject: Object)=> {
    const queryString: string = getUpdateString(updateObject);
    console.log('queryString', queryString);
    try {
      const result = await query(queryString);
      return result;
    } catch (err) {
      console.log('Error in updateBook', err);
    }
  }
  ctx.body = await updateBook(ctx.request.body);
};
