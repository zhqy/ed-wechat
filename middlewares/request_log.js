var logger = require('../common/logger');

module.exports = function (req, res, next) {
  if (exports.ignore.test(req.url)) {
    return next();
  }

  var t = new Date();
  logger.log('\n\nStarted', t.toISOString(), req.ip, req.method, req.url);

  res.on('finish', function () {
    var duration = ((new Date()) - t);

    logger.log('Completed', res.statusCode, ('(' + duration + 'ms)').green);
  });

  next();
};

exports.ignore = /\/public/;