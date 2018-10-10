var express = require('express');
var router = express.Router();

var cp = require('child_process');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/',function(req,res,next){
    let data = req.body.data;
    cp.exec('python ical_constructor.py ' + data, (err, stdout, stderr) => {
        if (err){
            console.log(err);
            res.status(200).send('0');
        }
        if (stdout) {
            res.status(200).send(stdout);
        }
    });
});

module.exports = router;
