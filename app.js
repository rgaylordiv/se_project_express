const express = require('express');

const mongoose = require('mongoose');

const mainRouter = require('./routes/index');

const { PORT = 3001 } = process.env;

const app = express();

mongoose
  .connect('mongodb://127.0.0.1:27017/wtwr_db')
  .then(() => {
    console.log("Connected to DB");
    })
    .catch(console.error);

app.use((req, res, next) => {
  req.user = {
    _id: '66f906d58dce302d6971bea4'// paste the _id of the test user created in the previous step
  };
  next();
});

app.use(express.json());
app.use('/', mainRouter);

// module.exports.createClothingItem = (req, res) => {
//   console.log(req.user._id); // _id will become accessible
// };

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})