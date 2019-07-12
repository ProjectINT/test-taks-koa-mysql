// @flow
const config = require('../../config');
const connection = require('../db-connection');

exports.getUpdateString = (updateObject: Object) => {
  const { bookId } = updateObject;
  delete updateObject.bookId;
  let setStrings: Array<string> = Object.keys(updateObject).map((key: string): string => `${key}="${updateObject[key]}"`);
  return `UPDATE ${config.tableName}
    SET ${setStrings.join(', ')}
    WHERE bookId=${parseInt(bookId)};`;
}

exports.getAddBookQuery = (body: Object, newId: number) => {
  const objectToInsert: Book = Object.assign(body, { bookId: newId });
  const columns = Object.keys(objectToInsert);
  const values = Object.values(objectToInsert).map(item => (typeof item === 'string' ? '\'' + item + '\'' : item ));
  return `INSERT INTO ${config.tableName} (${columns.join(', ')})
  VALUES (${values.join(', ')});`;
};

exports.getMaxNumber = (field: string, table: string, ctx: Context): Promise<number> => {
  return new Promise(resolve => {
    connection.query(`SELECT MAX(${field}) AS maxID FROM ${table};`, (err, result) => {
      if (err) ctx.throw(500, 'Error on getMaxNumber');
      console.log('typeof result[0].maxID : ', typeof result[0].maxID);
      const toResolve: number = parseInt(result[0].maxID);
      resolve(toResolve);
    });
  });
};

exports.getQueryByParams = (getParams: Object) => {
  for (let key in getParams) {
    if (key === 'minDate' || key === 'maxDate') {
      const formattedDate = formatDate(getParams[key]);
      getParams[key] = formattedDate ? formattedDate : undefined;
    }
  }
  const { minDate, maxDate, author, title, limit, offset, order } = getParams;
  const dateExist: number = minDate | maxDate;
  const queryString = `SELECT * FROM ${config.tableName}
  WHERE ${getDateCondition(minDate, maxDate)}
  ${getAuthorCondition(author, dateExist)}
  ${getTitleCondition(title, dateExist, author)}
  ${getOrderBy(order)}
  ${getLimit(limit)}
  ${getOffset(offset)}
  ;`;
  return trimString(queryString);
};

function trimString (str: string) {
  return str.replace(/\s{2,}/gm, ' ').replace(/\r{2,}/gm, '');
}

function getTitleCondition (title, dateExist, author) {
  if (title && (dateExist || author)) {
    return `AND title=${title}`;
  }
  if (title && !(dateExist || author)) {
    return `title=${title}`;
  }
  return '';
}

function getAuthorCondition (author, dateExist) {
  if (dateExist && author) {
    return `AND author=${author}`;
  }
  if (!dateExist && author) {
    return `author=${author}`;
  }
  return '';
}

function getDateCondition (minDate: number, maxDate: number ) {
  if (minDate & maxDate) {
    return `date BETWEEN ${minDate} AND ${maxDate}`;
  }
  if (minDate && !maxDate) {
    return `date > ${minDate}`;
  }
  if (!minDate && maxDate) {
    return `date < ${maxDate}`;
  }
  return '';
}

function formatDate (date: string): number | false {
  const dateToReturn = Date.parse(date);
  return typeof dateToReturn === 'number' ? dateToReturn : false;
}

function getLimit (limit) {
  return limit ? `LIMIT ${limit}` : '';
}

function getOffset (offset) {
  return offset ? `OFFSET ${offset}` : '';
}

function getOrderBy (order) {
  return order ? `ORDER BY ${order}` : '';
}