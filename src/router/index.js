// @flow
const Router = require('koa-router');
const router = new Router();
const { getBooks, addBook, updateBook } = require('../controllers');

router.get('/', (ctx, next) => {
  ctx.body = 'Hello world';
  next();
});

router.get('/api/books/:bookId?', getBooks);
router.post('/api/add-book', addBook);
router.post('/api/update-book', updateBook);

module.exports = router;
