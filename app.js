const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();
const { errors } = require('celebrate');
const mainRouter = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/error-handler');

const { PORT = 3001 } = process.env;

const app = express();

mongoose
  .connect('mongodb://127.0.0.1:27017/wtwr_db')
  .then(() => {
    console.log("Connected to DB");
    })
    .catch(console.error);

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/', mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})