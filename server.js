require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require("ejs")
var path = require('path');
const connectDB = require('./db/db')
const mainRouter = require('./routes/main')
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
var nodemailer=require('nodemailer');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit:50000}));
// app.use(expressLayout)
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs')
app.use(express.static("./public"));

app.use(helmet());
app.use(cookieparser());
// extra packages

// routes
app.use('/', mainRouter);
// app.get('/', (req,res) => {
//     res.send("Hello From server")
// })

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
   await connectDB("mongodb://localhost:27017/SOT")
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();