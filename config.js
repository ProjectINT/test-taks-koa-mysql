// @flow
const config = {
  host: process.env.HOST || 'localhost',
  dbUser: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  dbName: process.env.DB_NAME || 'books_db1',
  tableName: process.env.TABLE_NAME || 'books_table',
  booksCount: parseInt(process.env.BOOKS_COUNT) || 1000, // - 1e3, 1e5 to long for my mashine;
};

module.exports = config;