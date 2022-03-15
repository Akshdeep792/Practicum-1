const express = require("express");
const app = express();
const SignUser = require('../models/register')
const generateToken = require('../middleware/token')
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const bcrypt = require("bcryptjs");
app.use(helmet());
app.use(cookieparser());


const getVerify = async (req,res) => {
    const received_request = await SignUser.Request.findOne({session_token : req.query.token});
    if(received_request !=null && received_request != undefined)
    {
    if(req.query.token == received_request.session_token && received_request.session_token != "logged-out")
    {
        const img64 = received_request.image;
        const amount = received_request.amount;
        const account = received_request.account_no;
        res.render("verify" , {transactor_image : img64 , amount : amount , account_no : account.substring(account.length - 4) , queries : "token=" + req.query.token + "&id=" + req.query.id});
    }
    else
    res.redirect("/expired");
    }
    
}

const postVerify = async(req, res) => {
    const received_request = await SignUser.Request.findOne({session_token : req.query.token});
    if(received_request !=null && received_request != undefined)
    {
    const _id = received_request.userid;
    const user_username = await SignUser.Register.findOne({_id : _id});
    if(req.query.token == received_request.session_token && received_request.session_token != "logged-out")
    {
       const status=req.body.verification;
    if(status == "1")
    {
        await SignUser.Register.findByIdAndUpdate({_id} , {$set : {amount : user_username.amount - received_request.amount}})
        await SignUser.Request.updateMany({_id : req.query.id} , {$set : {payment_status : "verified" , session_token : "logged-out"}})

        res.redirect("/confirmed");
    }
    else if(status == "0")
    {
        await SignUser.Request.updateMany({_id : req.query.id} , {$set : {payment_status : "denied" , session_token : "logged-out"}})
        res.redirect("/confirmed");
    }
    else
    {
        await SignUser.Request.updateMany({_id : req.query.id} , {$set : {payment_status : "password-changed"}})
        res.redirect("/reset?token=" + req.query.token + "&id=" + req.query.id);
    }
    }
    else
        res.redirect("/expired");
    }
    else
        res.redirect("/expired");
}

const getSuccess = (req,res) =>{
    res.render("success");
}

const getDecline = (req,res) => {
    res.render("decline")
}
const getError = (req,res) => {
    res.render("error")
}
const getReset = async( req,res) => {
    const received_request = await SignUser.Request.findOne({session_token : req.query.token});
    if(received_request !=null && received_request != undefined)
    {
    if(req.query.token == received_request.session_token && received_request.session_token != "logged-out")
    {
        res.render("reset" , {error_msg_reset : err_msg_reset , queries : "token=" + req.query.token + "&id=" + req.query.id});
    }
    else
    res.redirect("/expired");
    }
    else
    res.redirect("/expired");
}

const postReset = async (req,res) => {
    const received_request = await SignUser.Request.findOne({session_token : req.query.token});
    if(received_request !=null && received_request != undefined)
    {
    const _id = received_request.userid;
    const request_id = req.query.id;
    const user_username = await SignUser.Register.findOne({_id : _id});

    if(req.query.token == received_request.session_token && received_request.session_token != "logged-out")
    {
    const oldpassword = req.body.Oldpassword;
    let newpassword = req.body.Newpassword;
    const confirmpassword = req.body.Confirmpassword;

    const isMatch_reset = await bcrypt.compare(oldpassword, user_username.password);

    if(!isMatch_reset)
    {
            err_msg_reset = "*Incorrect password";
            res.redirect("/reset?token=" + req.query.token + "&id=" + req.query.id);
            return;
        }
        else if(oldpassword == newpassword)
        {
            err_msg_reset = "*New password cannot be old password";
            res.redirect("/reset?token=" + req.query.token + "&id=" + req.query.id);
            return;
        }
        else if(newpassword.length <=5)
        {
            err_msg_reset = "*Password must be longer than 5 characters";
            res.redirect("/reset?token=" + req.query.token + "&id=" + req.query.id);
            return;
        }
        else if(newpassword != confirmpassword)
        {
            err_msg_reset = "*Passwords do not match";
            res.redirect("/reset?token=" + req.query.token + "&id=" + req.query.id);
            return;
        }
        else
        {
            newpassword = await bcrypt.hash(newpassword , 10);
            await SignUser.Register.findByIdAndUpdate({_id} , {$set : {password : newpassword}})
            await SignUser.Request.updateOne({session_token : req.query.token} , {$set : {session_token : "logged-out"}})
            res.redirect("/confirmed");
        }
    }
    else
    res.redirect("/expired");
    }
    else
    res.redirect("/expired");
    
}

const getConfirmed = (req,res) => {
    res.render("confirm")
}

const getExpired = (req,res) => {
    res.render("expire")
}

module.exports = {getVerify, postVerify, getSuccess, getDecline, getError ,getReset, postReset, getConfirmed, getExpired}