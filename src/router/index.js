// @flow
const Router = require('koa-router');
const koaBody = require('koa-body');
const router = new Router();
const { getBooks, addBook, updateBook } = require('../controllers');

router.get('/', (ctx, next) => {
  ctx.body = 'Hello world';
  next();
});

router.get('/api/books/:bookId?', getBooks)
  .post('/add-book', koaBody(), addBook)
  .post('/update-book', koaBody(), updateBook);


module.exports = router;
