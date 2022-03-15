const express = require("express");
const { getVerify, postVerify, getSuccess, getDecline, getError, getReset, postReset, getExpired, getConfirmed } = require("../controllers/final");
const router = express.Router();

const {getloggin, postsignup, postloggin, getsignup} = require('../controllers/main');
const { getPayment, postPayment } = require("../controllers/payment");
const { getWebcam , postWebcam, getWaiting, postWaiting} = require("../controllers/webcam");
const authMiddleware = require('../middleware/auth')


router.route('/').get(getloggin).post(postloggin)
router.route('/sign-up').get(getsignup).post(postsignup)
router.route('/payment').get(authMiddleware,getPayment).post(postPayment)
router.route('/webcam').get(authMiddleware, getWebcam).post(postWebcam)
router.route('/waiting').get(authMiddleware, getWaiting).post(postWaiting)
router.route('/verify').get(getVerify).post(postVerify)
router.route('/success').get(getSuccess)
router.route('/decline').get(getDecline)
router.route('/error').get(getError)
router.route('/reset').get(getReset).post(postReset)
router.route('/confirmed').get(getConfirmed)
router.route('/expired').get(getExpired)
module.exports = router