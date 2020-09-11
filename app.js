const express = require('express');

const app = express();

const userRouter = require('./router/user');
const postRouter = require('./router/post');
const topicRouter = require('./router/topic');
const commentRouter = require('./router/comment');
const followRouter = require('./router/follow');

require('./db/mongoose');

const port = process.env.PORT;

app.use(express.json());

app.use(userRouter);
app.use(postRouter);
app.use(topicRouter);
app.use(commentRouter);
app.use(followRouter);

app.listen(port, () => {
    console.log('Server dang chay port ', port);
})
