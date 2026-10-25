
const express = require("express")

const app = express()

const mongoose = require("mongoose") 

let passport = require('passport');
let session = require('express-session');
let flash = require('connect-flash');


const{ObjectId} = require("mongodb") // works with id 
 
const PORT = process.env.PORT || 3000;

require("dotenv").config()
app.use(express.json()) // reads the json content of the req.body
app.use(express.static('public')) // renders static pages 
app.set("view engine","ejs") // for template rendering 
app.use(express.urlencoded({extended:true})) // forms from the frontedn to read it into req.body

app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize()); // sers passport up/running 
app.use(passport.session()); // looks for saved id from the req.session
app.use(flash()); // message for the login and signup error

require('./config/passport')(passport)

   // render landing page
     app.get("/",(req,res)=>{
        res.render("landing.ejs")
     })

 // go to the database then to the collection
 // get the all the documents from the collection(find return cursor object)
 // convert it to array 
 // sort them in descending votes when displayed
 // render those questions in ejs for template

app.get("/queue",async(req,res)=>{
    try{
        const questions = await mongoose.connection.db
        .collection("Questions")  // to to specific collections
        .find() // returns cursor object
        .sort({votes:-1}) // sort in descending votes order
        .toArray() // gives an array 
        res.render("questionQueue.ejs",{
            questions:questions // render ejs template for the question array
        })
    }
    catch(err){
        console.log(err)
        res.status(500) 
    }
})


// // go to the database then to the collection
// get the id from the cliennt that it sent
// find that specific id from the database
// update the votes/increment by 1
// send back the updated votes to back to the client
app.put("/upvote", isLoggedin, async(req,res)=>{
    console.log(req.body)
    try{
    await mongoose.connection.db
    .collection("Questions")
    .findOneAndUpdate({
        _id: new ObjectId(req.body.id) // vote is specifically updated by the id 
    } , 
    {
    $inc : {votes:1} 
    },
    )
    return res.status(204).end() // send response and close it 
}
catch(error){
    console.log(error)
res.status(500).json({message:"Server Error"})
}
})

// this performs adding to the database 
// forms send  post request to the /questions route using action and method attributes using the type submit from the client
// express gets those payload to the server
// the server rediredcts to /queue where all the questions list are found
app.post("/questions", isLoggedin , async(req,res)=>{
    try{
        // values the user is only allowded to sned
    const { text,topic,name }= req.body

    // building the payload with both what the user sends and not sent such as votes,creayedAt etc
    const questionPayLoad = {
        text,
        topic,
        name,
        createdAt : new Date() ,  // safe to create in the server
        votes: 0 ,
        answered:false
    }

    // insert thq question to the database as record/document id automatically added by mongoDb _id
    await mongoose.connection.db.collection("Questions").insertOne(questionPayLoad)
         res.redirect("/queue") // back to the question list with a new question

    }  catch(error){
    console.log(error)
    res.status(500).send("Server Error")
    }
    })

    // define delete route
    // read the id of the question from the client
    // convert the id into mongoDB object id
    // use the findOneAndDelete method on collections
app.delete("/delete-question",isLoggedin,async(req,res)=>{
    try{
    await mongoose.connection.db.collection("Questions").findOneAndDelete({_id:new ObjectId(req.body.id)})
    res.status(204).end()
    }  catch(error){
        res.status(500).send("Server Error")
    }
})

 //  route for completed questions
 app.put("/completed",isLoggedin , async(req,res)=>{
    try{
        await mongoose.connection.db.collection("Questions").findOneAndUpdate({
            _id : new ObjectId(req.body.id)
        } ,{
            $set : {
            answered : true  
            }
        }) 
        return res.status(204).end()

    } 
    catch(error){
        console.log(error)
        res.status(500).json({message:"Server Error"})
    }
 })

// =============================================================================
// AUTHENTICATE ==================================================
// =============================================================================

app.get("/login",function(req,res){
    res.render("login.ejs",{message: req.flash("loginMessage")})
})

// Process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/queue',
    failureRedirect: '/login',
    failureFlash: { type: 'loginMessage' }
 }));

// SIGNUP =================================
 app.get('/signup', function(req, res) {
res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// Process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/queue',
    failureRedirect: '/signup',
    failureFlash: { type: 'signupMessage' }
 }));


// Connections
 mongoose.connect(process.env.MONGODB_CONNECTIION,{
 }).then(()=>{
    console.log("Connected to the MongodDB")
    app.listen(PORT,()=>console.log("Connected to port", PORT))
 }) .catch(err=>console.log("Error connecting to the database",err))


// middleware for security guard
// req.isAuthenticated comes fro Passport and ensure the user is logged in

function isLoggedin(req,res,next){
    if (req.isAuthenticated())
        return next()
    res.redirect("/login")
}