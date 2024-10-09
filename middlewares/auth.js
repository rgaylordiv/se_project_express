const jwt = require('jsonwebtoken');
const { authenticationError } = require('../utils/errors');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if(!authorization || !authorization.startsWith('Bearer ')){
    return res.status(authenticationError).send({ message: 'Authorization Required'});
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try{
    payload = jwt.verify(token, JWT_SECRET);
  } catch(err){
    return res.status(authenticationError).send({ message: 'Authorization Required'});
  }

  req.user = payload;

  next();
}

module.exports = auth;
