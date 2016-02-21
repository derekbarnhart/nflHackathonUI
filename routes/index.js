var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Realtime Coverage', filePath:'sample_play_touchdown.csv' });
});

router.get('/:playString',function(req, res, next){
  console.log(req.params)
  res.render('index',{title:'Realtime Coverage', filePath: req.params.playString +'.csv'})
});

router.get('/heat', function(req, res, next) {
  res.render('heat', { title: 'Express' });
});


module.exports = router;
