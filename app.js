const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

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

app.post('/register', (req, res)=>{
    const newUser = new User(
        {
            email: req.body.username,
            password: req.body.password
        }
    );
    console.log(newUser);
    //saving the newUser to database
    newUser.save().then(function(result){
        console.log(result);
        if(result != null){
          console.log("User Registered");
          res.render('secrets');
        }
        else{
          console.log("Cannot Register User");
        }
    });
});

















//------------------------------------SETTING PORT---------------------------------------//
const port = process.env.PORT || 5000

app.listen(port, function(){
    console.log(`Server started on port ${port}`);
})