const { BussinessUserOnly, AuthenticatedOnly } = require("../middleware/Authenticate");
const User = require("../model/User");

const Router = require("express").Router()

Router.get("/pannel", [ BussinessUserOnly, AuthenticatedOnly ], async (req, res, next) => {
    const userEmail = req.session.user?.email

    const user = await User.findOne({ email: userEmail });

    res.render("pannel", { user })
})

module.exports = Router