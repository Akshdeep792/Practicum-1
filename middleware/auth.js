const express = require("express");
const app = express();
const SignUser = require('../models/register')
const customAPIError = require('../errors/custom-error')
const helmet = require("helmet");
app.use(helmet());
const authMiddleware = (req,res,next) => {
    const login_token =  SignUser.Request.findOne({login_token : req.cookies.login_token})
    try{
       if(login_token && req.cookies.login_token != 'logged-out'){
           next() ;  
       
       }
       else{
           res.redirect("/?err=*Please log in first");
           return ;   
       } 
    }catch{
        throw new customAPIError('Not authorized to access this route', 400);
    }
  

}

module.exports = authMiddleware