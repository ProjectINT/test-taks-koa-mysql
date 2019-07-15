// @flow
const promisify = require('util').promisify;
const config = require('../../config');
const connection = require('../db-connection');
const query = promisify(connection.query).bind(connection);

exports.escapeQuotes = (value: string | number, ctx: Context) => {
  console.log('value in escapedQuotes', value);
  if (typeof value === 'string') {
    const escaped = value.replace(/'|"|`/gm, (match) => {
        switch (match) {
          case "\'":
            return "\\'";
          case '\"':
            return "\\'";
          case '\`':
            return '\\`';
          default:
            break;
        }
      });
    return escaped;
  } else {
    ctx.throw(400, 'Value is not a string');
  }
}

exports.getUpdateString = (updateObject: Object) => {
  for (let key in updateObject) {
    const escapedValue = module.exports.escapeQuotes(updateObject[key]);
    updateObject[key] = escapedValue;
  }
  const { bookId } = updateObject;
  delete updateObject.bookId;
  let setStrings: Array<string> = Object.keys(updateObject).map((key: string): string => `${key}="${updateObject[key]}"`);
  return `UPDATE ${config.tableName}
    SET ${setStrings.join(', ')}
    WHERE bookId=${parseInt(bookId)};`;
}

exports.getAddBookQuery = (body: Object, newId: number) => {
  for (let key in body) {
    const escapedValue = module.exports.escapeQuotes(body[key]);
    body[key] = escapedValue;
  }
  const objectToInsert: Book = Object.assign(body, { bookId: newId });
  const columns = Object.keys(objectToInsert);
  const values = Object.values(objectToInsert).map(item => (typeof item === 'string' ? '\'' + item + '\'' : item ));
  return `INSERT INTO ${config.tableName} (${columns.join(', ')})
  VALUES (${values.join(', ')});`;
};

exports.getMaxNumber = async (field: string, table: string, ctx: Context): number => {
  try {
    const result = await query(`SELECT MAX(${field}) AS maxID FROM ${table};`);
    console.log('result in getMaxNumber', result);
    const toReturn: number = parseInt(result[0].maxID);
    return toReturn;
  } catch (error) {
    console.log('Error in getMaxNumber', error);
  }
};

exports.getQueryByParams = (getParams: Object) => {
  for (let key in getParams) {
    const escapedValue = module.exports.escapeQuotes(getParams[key]);
    console.log('escapedValue', escapedValue);
    getParams[key] = escapedValue;
    if (key === 'minDate' || key === 'maxDate') {
      const formattedDate = formatDate(getParams[key]);
      getParams[key] = formattedDate ? formattedDate : undefined;
    }
  }
  const { minDate, maxDate, author, title, limit, offset, order } = getParams;
  const dateExist: number = minDate | maxDate;
  // In this case using pattern .join('AND') is not useful
  // because we have 3 varios in getDateCondition function
  // we can use it only for title and author:
  const queryString = `SELECT * FROM ${config.tableName}
  WHERE ${getDateCondition(minDate, maxDate)}
  ${title || author ? getTitleAuthorCondition(title, author, dateExist) : ''}
  ${getOrderBy(order)}
  ${getLimit(limit)}
  ${getOffset(offset)}
  ;`;
  return trimString(queryString);
};

function trimString (str: string) {
  return str.replace(/\s{2,}/gm, ' ').replace(/\r{2,}/gm, '');
}

function getTitleAuthorCondition (title, author, dateExist) {
  let arr = [];
  title ? arr.push(`title="${title}"`) : 'nothing';
  author ? arr.push(`author="${author}"`) : 'nothing';
  if (dateExist) {
    return 'AND ' + arr.join(' AND ');
  }
  return arr.join(' AND ');
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