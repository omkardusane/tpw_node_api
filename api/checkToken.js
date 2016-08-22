/**
 * Created by Omkar Dusane on 13-Mar-16.
 */

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var dbconn = require('./db');
var db = new dbconn();

module.exports =  function checkToken(req,res,next){
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
                    req.omdata = {email : doc.email} ;
                    next();
                }
            });
        }
    });
};
