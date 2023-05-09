const User = require("../model/User");

function AuthenticatedOnly(req, res, next) {
    if(req.session.isAuthenticated) {
        next()
    } else {
        if(req.path === '/account/login') {
            next();
        } else {
            res.redirect("/account/login")
        }
    }
}

function NoneAuthenticatedOnly(req, res, next) {
    if(req.session.isAuthenticated) {
        res.redirect("/")
    } else {
        next()
    }
}

async function BussinessUserOnly(req, res, next) {
    if(req.session.isAuthenticated) {
        const user = await User.findOne({ email: req.session.user.email })
        if(user.accountType != "personal") {
            next()
        } else {
            res.redirect("/")
        }
    } else {
        res.redirect("/")
    }
}

async function PersonalUserOnly(req, res, next) {
    if(req.session.isAuthenticated) {
        const user = await User.findOne({ email: req.session.user.email })
        if(user.accountType == "personal") {
            next()
        } else {
            res.redirect("/")
        }
    } else {
        res.redirect("/")
    }
}


module.exports = { AuthenticatedOnly, NoneAuthenticatedOnly, BussinessUserOnly, PersonalUserOnly }