const { HTTP_STATUS } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
};

module.exports = { errorHandler };