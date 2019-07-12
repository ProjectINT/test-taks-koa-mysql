// @flow
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const fillDataBase = require('./fill-db');
const router = require('./router');

const app = new Koa();
const port = 3000;

app.use(async (ctx: Context, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', (err, ctx: Context) => {
  console.log('error : ', err, ctx.status);
});

app.use(bodyParser());
app.use(router.routes());

const fillDb = async () => {
  const fill = await fillDataBase();
  console.log('Database status', fill);
};
fillDb();

app.listen(port, console.log(`Server running on ${port}`));
