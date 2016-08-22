var express= require('express');
var api = new express();
var async = require('async');



var dbconn = require('./api/db');
var db = new dbconn();

var bodyparser    = require('body-parser');
var morgan    = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

api.use(morgan('dev'));

var student = require('./api/student');
api.use('/student',student);

var office = require('./api/office');
api.use('/office',office);

var checkToken = require('./api/checkToken');

api.get("/users",function(req,res){

db.users.find({},{_id:0}).toArray(function(err,docs){res.send(docs)}) ;

});

function generateOTP(){
    var i = 0;
    do { i = Math.floor((Math.random() * 10000) + 1);
        console.log(i);}
    while(i<1000 || i>10000);
    return i;
}



api.post("/signUp",function(req,res){
   // req : email mobile name password
    var list = ['email','name','mobile','password'];
    var invalid =[];
    var omdata ={};
    list.forEach(function(t){
        if(!req.headers.hasOwnProperty(t)){
            invalid[invalid.length]=t;
        }
        else{
            omdata[t] = req.headers[t];
        }
    });
    if(invalid.length==0){
        var newUser = true ;
        async.series([
       function(c1){
           db.users.find({email:omdata.email},{}).toArray(function(e,doc){
               if(doc.length==0){
                    c1();
                }
                else{
                    newUser =false;
                    res.json({email:omdata.email,success:false,message:'you are already registered , cant register again if you have forgot password , please ask omkardusane@gmail.com'});
                }
            });
       }
      ,
       function(c2){
           if(newUser){
                omdata.otp = generateOTP();
                db.signup_req.insert(omdata).then(function(e,doc){
                    var email = omdata.email;
                    if(email.toString().indexOf('@')!=-1)
                    {
                        db.sendEmail("Your OTP to login is : "+omdata.otp+" \n " +
                        "Please use this when you verify your account at T&P registration site \n congrats", omdata.email,function(){
                            res.json({email:omdata.email,success:true,message:'go ahead and ask for otp and make verifycall' +
                            ' otp sniff '+omdata.otp,redir:'/verifyOTP'});
                            c2();
                        },function(){
                            res.json({success:false,message:"problem sending email please contact omkar otp sniff "+omdata.otp});
                        });
                    }
                    else{
                        console.log('her ELSEE');
                        res.json({success:false,message:"your email is not worthy of sending an email"});
                        c2();
                    }
                });
            }

       }
      ]);
    }
    else{
        res.json({success:false,message:'missing params',missing:invalid});
    }

});


api.post("/verifyOTP",function(req,res){
    var list = ['email','otp'];
    var invalid =[];
    var omdata ={};
    list.forEach(function(t){
        if(!req.headers.hasOwnProperty(t)){
            invalid[invalid.length]=t;
        }
        else{
            omdata[t] = req.headers[t];
        }
    });
    if(invalid.length==0){
        omdata.otp = Number(omdata.otp);
        console.log(omdata);
        db.signup_req.findOne(omdata,{},function(e,doc){
            console.log(doc);
            if(!e && doc!=null){
                console.log('here');
                db.signup_req.remove(doc).then(function(e2,d2){
                    db.users.insert(doc).then(function(e3,d3){
                        res.json({email:omdata.email,success:true,message:'verified',redir:'/signIn'});
                    })
                });
            }
            else{
                res.json({email:omdata.email,success:false,message:'wrong OTP'});
            }
        });
    }
    else{
        res.json({success:false,message:'missing params',missing:invalid});
    }

});

api.post('/showsome',checkToken,function(req,res){
   console.log('im here');
    console.log(req.omdata);
  res.send("hello you good person");

});


api.post("/signIn",function(req,res){
  // req : email password
    var email = req.headers.email ;
    var pw = req.headers.pw;

    db.users.findOne({email:email,password:pw},{_id:0},function(err,doc){
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
                expiresIn: 36000 // expires in 24 hours
            });
            res.json(ret) ;
        }
      });
});



api.listen(31000,function(){
    console.log('running on 31000');
});