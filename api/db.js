/**
 * Created by Omkar Dusane on 11-Mar-16.
 */

var mongoose = require('mongoose');
var mrl = 'mongodb://127.0.0.1:27017/tpw2';
var mailer = require('nodemailer');

var db ;
mongoose.connect(mrl);
db = mongoose.connection ;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    // we're connected!
    console.log('got db connection');
});

var counters = db.collection('seq_counts');
counters.count({},{'generalcount':1},function(err, result) {
    if(result == 0){
        counters.insert({'generalcount':1});
    }
});

function tpFoo(){
    console.log("glowing_ops");
};

tpFoo.prototype.ops_users = db.collection('ops_users');
tpFoo.prototype.users = db.collection('users');
tpFoo.prototype.student_profiles = db.collection('student_profiles');
tpFoo.prototype.signup_req = db.collection('signup_req');

tpFoo.prototype.jobs = db.collection('jobs');
tpFoo.prototype.updates_on_jobs = db.collection('updates_on_jobs');
tpFoo.prototype.rounds = db.collection('rounds');
tpFoo.prototype.selections = db.collection('selections');

tpFoo.prototype.secret = config.jwt_secret;

tpFoo.prototype.idMaker = function(){
    return new mongoose.Types.ObjectId();
};

tpFoo.prototype.seqIdMaker = function(next){
    counters.find({},{'generalcount':1}).toArray(
        function(err, result) {
            if(result.length == 0){
                counters.insert({'generalcount':0}
                    ,function(err,doc){
                        next( doc.generalcount) ;
                    }
                );
            }
            else{
                var gc=  result[0].generalcount+1 ;
                counters.update(result[0],{$set:{'generalcount':(gc)}}
                    ,function(err,dc){
                        next(gc) ;
                    }
                );
            }
        });
    return new mongoose.Types.ObjectId();
};

var smtpTransport = mailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "omkardusan@gmail.com",
        pass: config.password
    }
});


tpFoo.prototype.sendEmail = function(text,to ,callback,err){
    smtpTransport.sendMail({
        from: "hey <omkardusan@gmail.com>", // sender address
        to: "Yo <"+to+">", // comma separated list of receivers
        subject: "Watumull T & P automated mail", // Subject line
        text: " Hi ,\n "+text // plaintext body
    }, function(error, response){
        if(error){
            //console.log(error);
            err();
        }else{
            console.log("Message sent: " + response.message);
            callback();
        }
    });

};


module.exports = tpFoo ;
