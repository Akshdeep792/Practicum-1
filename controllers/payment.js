const express = require("express");
const app = express();
const SignUser = require('../models/register')
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
app.use(helmet());
app.use(cookieparser());
var err_msg_no_p="";
var err_msg_code_p="";
var acc_name="";
var acc_no="";
var IFSC="";
var amount="";
var err_msg_reset="";
let user_username = "";
var err_msg_amount_p="";

const getPayment = async(req,res) => {
  // try{  
    res.render("payment",{acc_name_p : acc_name , err_msg_no_p : err_msg_no_p , err_msg_amount_p : err_msg_amount_p , acc_no_p : acc_no , err_msg_code_p : err_msg_code_p , IFSC_p : IFSC , amount_p : amount});
    acc_name="";
    acc_no="";
    IFSC="";
    amount="";
    err_msg_no_p = "";
    err_msg_amount_p = "";
    err_msg_code_p = "";
}
// catch{
//     res.redirect("/sign-up?err=*There was an error");
// }    
// }

const postPayment = async (req,res) => {
  try {
    const login_token = await SignUser.Request.findOne({login_token : req.cookies.login_token})
        if(login_token && req.cookies.login_token !='logged-out')
        {
            const _id = login_token.userid;
            const user_username = await SignUser.Register.findOne({_id : _id});
            err_msg_no_p="";
            err_msg_code_p="";
            err_msg_amount_p = "";
            acc_name=req.body.Acc_name;
            acc_no=req.body.Acc_no;
            IFSC=req.body.IFSC;
            amount=req.body.amount;
            const avail_amount = user_username.amount;
            if(acc_no.length<9||acc_no.length>18)
            {
                err_msg_no_p="*Invalid account number";
                acc_no="";
                res.redirect("/payment");
            }
            else if(!(/^[A-Z]{4}0[A-Z0-9]{6}$/.test(IFSC)))
            {
                err_msg_code_p="*Invalid IFSC code";
                IFSC="";
                res.redirect("/payment");
            }
            else if(amount > avail_amount || amount <=0)
            {
                if(amount > avail_amount)
                err_msg_amount_p = "*Insufficient funds";
                else
                err_msg_amount_p = "*Enter a valid amount";
                amount = "";
                res.redirect("/payment");
            }
            else
                {
                    res.redirect("/webcam?name=" + acc_name +  "&amount=" + amount + "&IFSC=" + IFSC + "&account="+acc_no);
                    acc_name="";
                    acc_no="";
                    IFSC="";
                    amount="";
                    err_msg_no_p = "";
                    err_msg_amount_p = "";
                    err_msg_code_p = "";
                }
            
        }
        else
        {
            res.redirect("/?err=*Please log in first");
            acc_name="";
            acc_no="";
            IFSC="";
            amount="";
            err_msg_no_p = "";
            err_msg_amount_p = "";
            err_msg_code_p = "";
        }

    }catch(error)
    {
        res.redirect("/?err=*There was an error");
        acc_name="";
        acc_no="";
        IFSC="";
        amount="";
        err_msg_no_p = "";
        err_msg_amount_p = "";
        err_msg_code_p = "";
    }
  

}


module.exports = {getPayment, postPayment}