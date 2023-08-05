//jshint esversion:6

// requiring dotenv for keepting aur encryption key and api key
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//for level 3 authentication
//const md5 = require('md5');

// for level 2 authentication
// const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Connecting mongoDB with the node sever
mongoose.connect("mongodb://127.0.0.1:27017/userDB");

// Event listeners to check connection status
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB!");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

//Creating a Schema for users

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// defining secret for encrption
// defined inside .env file for security
// console.log(process.env.SECRET)

//we must specify the plugin before we create mongoose model for level 2 authentication
//userSchema.plugin(encrypt, {secret: process.env.SECRET , encryptedFields: ["password"]});

// Setting up new user model
const User = new mongoose.model("User", userSchema);

// Handling initial route

app.get("/", (req, res) => {
  res.render("home");
});

// Handling login route

app.get("/login", (req, res) => {
  res.render("login");
});

// Handling register route

app.get("/register", (req, res) => {
  res.render("register");
});

// Catching the register request
app.post("/register",(req, res) => {
  // creating a new user with the entered value
  try {

    bcrypt.hash(req.body.password,saltRounds,async function(err,hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
          });
          const savedUser = await newUser.save();
          res.render("secrets");
          console.log("User registered successfully:", savedUser);
    });

    
  } catch (error) {
    console.error("Error registering user:", error);
  }
});

//Handelling request for login route

app.post("/login", async (req, res) => {
  // Accessing the credentials
  const username = req.body.username;
  const password = req.body.password;

  // checking the credentials against our database using the find method of mongoose
  try {
    const foundUser = await User.findOne({
      email: username,
    });
    if (foundUser) {
      console.log(` ${foundUser}`);
      bcrypt.compare(password,foundUser.password,(err,result)=>{

        if(result=== true){
            res.render('secrets');
        }


      });
    } else {
      console.log("No such User");
    }
  } catch (error) {
    console.log(`Error finding user : ${error}`);
  }
});

app.listen(3000, () => {
  console.log(`Server started on port: 3000`);
});
