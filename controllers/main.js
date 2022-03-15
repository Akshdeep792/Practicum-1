const express = require("express");
const app = express();
const SignUser = require('../models/register')
const generateToken = require('../middleware/token')
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const bcrypt = require("bcryptjs");
app.use(helmet());
app.use(cookieparser());
var uName = "";
var pWord = "";
var email = "";
let user_uName = "";

const getloggin = async (req, res) => {
  res.render("login", { err_msg_l: req.query.err });
}

const postloggin = async (req, res) => {
  try {
    uName = req.body.Username;
    let paWord = req.body.Password;

    user_uName = await SignUser.Register.findOne({ username: uName });
    if (user_uName == null) {
      res.redirect("/?err=*Incorrect Username");
      return;
    }
    const isMatch = await bcrypt.compare(paWord, user_uName.password);
    if (isMatch) {
      const login_token = generateToken(100);
      const register_req = SignUser.Request({
        login_token: login_token,
        userid: user_uName._id,
        payment_status: "pending"
      })
      const registered = await register_req.save();
      console.log(registered)
      res.cookie("login_token", login_token, { maxAge: 1200000, httpOnly: true, secure: true, sameSite: 'lax' });
      res.status(201).redirect("/payment");
      return;
    } else {
      res.status(400).redirect("/?err=*Wrong Username or Password");
      return;
    }

  } catch (err) {
    res.redirect("/")
  }
}
const getsignup = async (req, res) => {
  res.render("signup", { err_msg_s: req.query.err, uname_s: uName, pword_s: pWord, email_s: email })
  uName = "";
  pWord = "";
  email = "";
  err_msg_s = "";
}

const postsignup = async (req, res) => {

  try {
    err_msg_s="";
    uName = req.body.Username;
    pWord = req.body.Password;
    email = req.body.Email;

    let isAlreadyTaken = await SignUser.Register.findOne({username : uName})

    if(uName.length <= 6){
      uName="";
      res.redirect("/sign-up?err=*Username must be longer than 6 characters");
    }
    else if(pWord.length<=8){
      pWord="";
        res.redirect("/sign-up?err=*Password must be longer than 5 characters");
    }
    else if(isAlreadyTaken != NULL){
      res.redirect("/sign-up?=*This username is already taken.")
    }
    else{
    const registerUser = new SignUser.Register({
      username: uName,
      password: pWord,
      email: email,
      amount: 10000000,
      secret_session_token: "null"
    })
    uName = "";
    pWord = "";
    email = "";
    const registered = await registerUser.save();
    console.log(registered)
    res.status(201).redirect("/");
  }
  } catch (err) {
    res.redirect("/sign-up?err=*Username must be greater than 4 characters")

  }
}

module.exports = { getloggin, getsignup, postloggin, postsignup }