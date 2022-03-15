const express = require("express");
const app = express();
const SignUser = require('../models/register')
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const generateToken = require("../middleware/token");
const sendEmail = require("../middleware/mail")
app.use(helmet());
app.use(cookieparser());

const getWebcam = async (req, res) => {
    try {
        if (req.query.name == "" || req.query.account == "" || req.query.IFSC == "" || req.query.amount == "")
            res.redirect("/payment");
        else
            res.render("webcam", { queries: "name=" + req.query.name + "&IFSC=" + req.query.IFSC + "&account=" + req.query.account + "&amount=" + req.query.amount });
    }catch(err){
        res.redirect("/?err=*There was an error");
    }
}

const postWebcam = async (req, res) => {
    try{
        const login_token = await SignUser.Request.findOne({login_token : res.cookies.login_token})
        if(login_token && res.cookies.login_token != 'logged-out')
        {
            const img64 = req.body.Image64bit;
            const account_no = req.query.account;
            const user_username = await SignUser.Register.findOne({_id : login_token.userid});
            const secret_session_token = generateToken(100);
            const email_verify_port = req.protocol + "://" + req.get('host') + "/verify?token=" + secret_session_token + "&id=" + login_token._id;
            sendEmail(img64, user_username.email , req.query.amount , account_no.substring((req.query.account).length - 4) , email_verify_port);
            res.cookie("count", 1 , {maxAge: 1200000, httpOnly: true, secure: true, sameSite : 'lax'});
            res.redirect("/waiting");
        }
        else
    {
        res.redirect("/?err=*Please log in first");
    }
    }catch(err){
        res.redirect("/?err=*There was an error");
    }
}

const getWaiting = async(req,res) => {
    res.render("waiting");
}
const postWaiting = async (req, res)=> {
    try{
        const login_token = await SignUser.Request.findOne({login_token : req.cookies.login_token})
        if(login_token && req.cookies.login_token !='logged-out')
        {
            var count = parseInt(req.cookies.count , 10);
            const request_id = login_token._id;
            if(count <= 10)
            {
                var a = 0;
                let received_request;
                let payment_status = "pending";
                while(a<=20)
                {
                    received_request = await SignUser.Request.findOne({_id : request_id});
                    payment_status = received_request.payment_status;
                    if(payment_status == "verified")
                    {
                        await SignUser.Request.updateOne({_id : request_id} , {$set : {login_token : "logged-out"}})
                        res.clearCookie("login_token");
                        res.redirect("/success");
                        return;
                    }
                    if(payment_status == "denied" || payment_status == "password-changed")
                    {
                        await SignUser.Request.updateOne({_id : request_id} , {$set : {login_token : "logged-out"}})
                        res.clearCookie("login_token");
                        res.redirect("/decline");
                        return;
                    }

                    a++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            else
            {
                await SignUser.Request.updateMany({login_token : req.cookies.login_token} , {$set : {payment_status : "timed-out" , session_token : "logged-out" , login_token : "logged-out"}});
                res.clearCookie("login_token");
                res.redirect("/error");
                return;
            }
            count = count+1;
            res.cookie("count", count , {maxAge: 1200000, httpOnly: true, secure: true, sameSite : 'lax'});
            res.redirect("/waiting");
        }
        else
        res.redirect("/?err=*Please log in first");

    }catch(error)
    {
        console.log(error);
        res.redirect("/?err=*There was an error");
    }
}

module.exports = { getWebcam, postWebcam , getWaiting, postWaiting}