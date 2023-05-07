require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//CONNECTING TO MongoDB SERVER
const url = 'mongodb://127.0.0.1:27017/UserDB';
mongoose.connect(url).then(function(res){
    if ((res != null)&&(res.STATES.connected === 1)){
        console.log('Connected to MongoDB server');
    }
    else{
        console.log('Cannot connect to MongoDB server');
    }
});


//Creating User Schema
const userSchema = new mongoose.Schema(
    {
        email:{type:String, required: true},
        password: {type:String, required: true}
    }
);


//mongoose-encryption plugin for encrypting password//n
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password']});


//Creating User Model
const User = mongoose.model('User', userSchema);



// ----------------------------GET REQUESTS------------------------------//

app.get('/', function(req,res){
    res.render('home');
});


app.get('/login', function(req,res){
    res.render('login');
});


app.get('/register', function(req,res){
    res.render('register');
});




// ----------------------------POST REQUESTS-----------------------------//



// -----Registering Users ----- //

app.post('/register', (req, res)=>{

    const username = req.body.username;
    const plaintextPassword = req.body.password;


    User.findOne({email: username}).then((foundUser)=>{

        // Checking if User already exists
        if(foundUser != null){
            console.log(`Username: ${username}, already exists`);
            res.redirect('/login');
        }
        else{
            // Hashing the password
            bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
                if(!err){
                    // Creating new User----Store hash in DB.
                    const newUser = new User(
                        {
                            email: username,
                            password: hash
                        }
                    );
                
                    //saving the newUser to database
                    newUser.save().then(function(result){
                        if(result != null){
                        console.log(`User with username: ${username}, Registered`);
                        res.render('secrets');
                        }
                        else{
                        console.log("Cannot Register User");
                        }
                    });
                }
                else{
                    console.log("Error Hashing Password using bcrypt");
                    res.redirect('/register');
                }
            });
        }
    });
});



// ----- Logging In Users -----//

app.post('/login', (req, res)=>{

    // Reading Data submitted by the User
    const username = req.body.username;
    const plaintextPassword = req.body.password;

    //Checking if User exists:
    User.findOne({email: username}).then((foundUser)=>{
        if(foundUser == null){ // When user doesn't exist
            console.log(`Username: ${username}, does not exists`);
            res.redirect('/register');
        }
        else{ // When user exists
            //Checking Password
            const hash = foundUser.password;
            bcrypt.compare(plaintextPassword, hash, function(err, result) {
                if(!err){
                    if(result === true){ //hash == plaintextPassword
                        console.log(`Logged In as ${username}`);
                        res.render('secrets');
                    }
                    else{
                        console.log('Wrong Password');
                        res.redirect('/login');
                    }
                }
                else{
                    console.log("Failed to comapre Hashed password with plaintext password");
                    res.redirect('/login')
                }
            });
        }
    });
});

















//------------------------------------SETTING PORT---------------------------------------//
const port = process.env.PORT || 3000

app.listen(port, function(){
    console.log(`Server started on port ${port}`);
})