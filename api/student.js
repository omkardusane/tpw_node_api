/**
 * Created by Omkar Dusane on 11-Mar-16.
 */
var express= require('express');
var router = express.Router() ;

var checkToken = require('./checkToken');

var dbconn = require('./db');
var db = new dbconn();

router.post("/make",checkToken,function(req,res){
  var vars = [
  'full_name',
      'yoa',
      'gender',
      'degree',
      'yop',
      'pchoice',
      'college',
      'contact_number',
    'ssc',
    'hsc',
      'atkt_alive',
      'atkt_dead',
    'gpa1',
    'gpa2',
    'gpa3',
    'gpa4',
    'gpa5',
    'gpa6',
    'gpa7',
    'gpa8'
  ];
  var email = req.omdata.email;
  var missing =[];
  var obj ={};
  vars.forEach(function(e){
    if(!req.headers.hasOwnProperty(e)){
      missing[missing.length]=e;
    }
    else{
      obj[e]=req.headers[e];
    }
  });
  if(missing.length==0){
    obj.email = email;
    db.student_profiles.find({email:email},{}).toArray(function(e,docs){
      if(docs.length==0){
        db.student_profiles.insert(obj).then(function (e2,doc) {
          res.json({success:true,mesage:"inserted successfully",doc:doc});
        });
      }
      else{
        res.json({success:false,message:'you already have a profile'});
      }
    });
  }
  else{
    res.json({success:false,message:'missing parameters',missing:missing});
  }

});

router.post("/change",checkToken,function(req,res){
  var vars = [
    'full_name',
    'yoa',
    'gender',
    'degree',
    'yop',
    'pchoice',
    'college',
    'contact_number',
    'ssc',
    'hsc',
    'atkt_alive',
    'atkt_dead',
    'gpa1',
    'gpa2',
    'gpa3',
    'gpa4',
    'gpa5',
    'gpa6',
    'gpa7',
    'gpa8'
  ];

  var email = req.omdata.email;
  var obj ={};

  vars.forEach(function(e){
    if(req.headers.hasOwnProperty(e)){
      obj[e]=req.headers[e];
    }
  });

    db.student_profiles.find({email:email},{}).toArray(function(e,docs){
      if(docs.length==1){
        db.student_profiles.update({email:email},{$set:obj}).then(function (e2,doc) {
          res.json({success:true,mesage:"updated successfully",doc:doc});
        });
      }
      else{
        res.json({success:false,message:'you dont have a profile'});
      }
    });


});

router.post("/profile",checkToken,function(req,res){
  var email = req.omdata.email;
 db.student_profiles.findOne({email:email},{},function(e,doc){
  if(doc!=null && !e){
    res.json({success:true,doc:doc,message:"your profile sir"});
  }
   else{
    res.json({success:false,message:"some error in server OR you dont have a profile yet"});
  }

 });

});

module.exports = router ;



