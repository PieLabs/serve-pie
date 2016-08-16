const express = require('express');
const path = require('path');

module.exports = () => {
  let router = express.Router();
  
  router.use('/components', express.static(path.join(__dirname, '../components')));
  
  router.get('/', (req, res, next) => {
    res.render('main/index', {});
  });
  
  return router;
}