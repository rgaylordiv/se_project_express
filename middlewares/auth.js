const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../utils/config')
// const { authenticationError } = require('../utils/errors');
const UnauthorizedError  = require('../utils/UnauthorizedError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if(!authorization || !authorization.startsWith('Bearer ')){
    throw new UnauthorizedError('Authorization Required');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try{
    payload = jwt.verify(token, JWT_SECRET);
  } catch(err){
    throw new UnauthorizedError('Authorization Required');
    // return res.status(authenticationError).send({ message: 'Authorization Required'});
  }

  req.user = payload;

  return next(); // added return here for github action
}

module.exports = auth;
