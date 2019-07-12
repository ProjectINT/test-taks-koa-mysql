// @flow
const config = require('../../config');

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