/**
 * Created by Omkar Dusane on 11-Mar-16.
 */
var express= require('express');
var router = express.Router() ;

var dbconn = require('./db');
var db = new dbconn();

router.post("/signIn",function(req,res){
  // req : email password
  var email = req.headers.email ;
  var pw = req.headers.pw;

  db.ops_users.findOne({email:email,password:pw},{_id:0},function(err,doc){
    if (doc==null){
      var ret ={};
      ret.success = false;
      ret.message = 'invalid credentials';
      res.json(ret) ;
    }
    else
    {
      var ret ={};
      ret.success = true;
      ret.token = jwt.sign(doc, db.secret , {
        expiresIn: 36000 // expires in 10 hours
      });
      res.json(ret) ;
    }
  });
});


function enforceToken(req,res,next){
  var token = req.headers.token ;
  jwt.verify(token,db.secret , function(err, decoded) {
    if (err) {
      res.json({success:false,message:'invalid token'});
    }
    else {
      console.log(decoded.password);
      db.users.findOne({email:decoded.email,password:decoded.password},{},function(e,doc){
        if(doc==null){
          var ret ={};
          ret.success = false;
          ret.message = 'invalid authentication access';
          res.json(ret) ;
        }else{
          next();
        }
      });
    }
  });
}


router.get("/showAll",enforceToken,function(req,res){
  var vars = [
  ''
  ];

});

router.post("/selectOne",function(req,res){

});

router.get("/q",function(req,res){
 // year of passing
 // GPA wise
 // projections


});

module.exports = router ;

