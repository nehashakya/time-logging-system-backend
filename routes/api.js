var express = require('express');
var jwt    = require('jsonwebtoken');		// used to create, sign, and verify tokens
var mongoose = require('mongoose'); 		//Import the mongoose module

//Create userModel and workLogModel just by requiring the module
var userModel = require('../models/user');
var workLogModel = require('../models/workLog');


var router = express.Router();
var dbUri = 'mongodb://admin:admin@ds161336.mlab.com:61336/fullstack';
var secretKey = 'superSuperSecret';

//Set up default mongoose connection
mongoose.connect(dbUri, {}, function (err) {
    if (err) {
        throw err;
        return;
    }
    console.log('Connected to Database');
});

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


router.post('/login', function(req, res) {
    console.log("Logging in...");
    // find user
    userModel.findOne({username : req.body.username}, function(err, usr) {
        if (err) {
            return res.json({ 
                success: false, 
                message: 'Problem finding user. ' + err
            });
        }

        if (usr) {
            console.log("Found user: " + usr.password);
            // Make sure the password is correct
            usr.verifyPassword(req.body.password, function(err, isMatch) {
                if (err) {
                    return res.json({ 
                        success: false, 
                        message: 'Authentication failed. ' + err
                    });
                }

                // Password did not match
                if (!isMatch) {
                console.log('Authentication failed. Wrong password.');
                    return res.send({ 
                        success: false, 
                        message: 'Authentication failed. Wrong password.' 
                    }); 
                }

                // Success
                // if usrloyee is found and password is right
                // create a token
                var token = jwt.sign(usr.toJSON(), secretKey, { expiresIn: 86400 }); // expires in 24 hours 
                console.log(token);
                return res.json({
                    success:true,
                    token: token,
                    userId: usr._id,
                    message:'Token generated.'
                });
           });
        } else {
            console.log('Authentication failed. User not found.');
                return res.send({ 
                    success: false, 
                    message: 'Authentication failed. User not found.'
            });
        }
    });
});


// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
// router.use(function(req, res, next) {

//     // check header or url parameters or post parameters for token
//     var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

//     // decode token
//     if (token) {
//         // verifies secret and checks exp            
//         jwt.verify(token, secretKey, function(err, decoded) {
//             if (err) {
//                return res.json({ success: false, message: 'Failed to authenticate token.' });
//             } else {
//                 // if everything is good, save to request for use in other routesr
//                 next();
//             }
//         });
//     } else {
//         // if there is no token
//         // return an error
//         return res.status(403).send({
//             success: false,
//             message: 'No token provided.'
//         });
//     }
// });


/*
******************************************************************************************************************
*/


/* GET: findAllUsers */
router.get('/users', function(req, res, next) {
    console.log("Getting all users...");
  	userModel.find({}, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});

/* GET: findUserById */
router.get('/users/:id', function(req, res, next) {
    const id = req.params.id;
    console.log("Getting user for id " + id);
  	userModel.findById({_id:id}, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});


/* POST: createUser */
router.post('/users', function(req, res, next) {
    console.log('Creatind user...' + req.body.contactinfo);
	var user = new userModel({
        username: req.body.username,
        password: req.body.password,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
        email : req.body.email,
        contactinfo : req.body.contactinfo,
        designation : req.body.designation,
        department: req.body.department
	});
    user.save(function (err, result) {
  		if (err) return handleError(err);
  		res.send(result);
	});
});

/* PUT: updateUserById */
router.put('/users/:id', function(req, res, next) {
    const id = req.params.id;
    console.log('Updating user with id ' + id);
	userModel.findByIdAndUpdate({_id:id}, req.body, {new: true}, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});

/* DELETE: deleteUserById */
router.delete('/users/:id', function(req, res, next) {
    const id = req.params.id;
    console.log('Deleting user with id ' + id);
	userModel.deleteOne({_id:id}, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});

/*
******************************************************************************************************************
*/

/* GET: findWorkLogsById */
router.get('/users/:id/workLogs', function(req, res, next) {
    const id = req.params.id;
    console.log('Getting worklogs of user with id ' + id);
    workLogModel.find({user:id}, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});

/* POST: create */
router.post('/users/:id/workLogs', function(req, res, next) {
    const id = req.params.id;
    console.log('Creating workLog for user with id ' + id);
    userModel.findById({_id:id}, function (err, results) {
        if (err) throw err;
        var workLog = new workLogModel({
            date: req.body.date,
            titleOfWork : req.body.titleOfWork,
            descriptionOfWork : req.body.descriptionOfWork,
            noOfHours : req.body.noOfHours,
            user : results
        });
        workLog.save(function (err, result) {
            if (err) throw err;
            console.log("//////" + result);
            res.send(result);
        });
    });
});

/*
******************************************************************************************************************
*/

/* GET: findWorkLogs */
router.get('/workLogs', function(req, res, next) {
    console.log('Getting all worklogs...')
    workLogModel.find().populate('user')
        .exec(function (err, results) {
            if (err) throw err;
            res.send(results);
          });
});

module.exports = router;
