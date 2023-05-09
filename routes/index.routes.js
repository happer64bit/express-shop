const Router = require("express").Router();

const { AuthenticatedOnly, PersonalUserOnly } = require("../middleware/Authenticate");
const Sale = require("../model/Sale");
const User = require("../model/User");


Router.get("/", [AuthenticatedOnly], async (req, res) => {
    const userEmail = req.session.user?.email

    // Find the user document based on the email field
    const user = await User.findOne({ email: userEmail });
    const items = await Sale.aggregate([
        {
            $sample: {
                size: 30
            }
        }
    ])
    res.render("index", { isLoggedIn: req.session.isAuthenticated, user, items });
});

Router.get("/search", [AuthenticatedOnly], async(req, res) => {
    const { q } = req.query;

    const userEmail = req.session.user?.email

    const user = await User.findOne({ email: userEmail });

    const sales = await Sale.find({ 
        $or: [
            { name: { $regex: q, $options: "i" } }, 
            { description: { $regex: q, $options: "i" } }
        ]
    });
    res.render("search", { sales, user, q });
})


Router.get("/checkout/:id", [AuthenticatedOnly], async (req, res, next) => {
    const { id } = req.params
    const userEmail = req.session.user.email;

    const sale = await Sale.findOne({ _id: id })
    
    const user = await User.findOne({ email: userEmail });
    
    const owner = await User.findOne({ _id: sale.sellerId })

    console.log(owner)
    res.render("checkout", { item: sale, user, owner })
})

Router.get("/comfirmPayment", [AuthenticatedOnly, PersonalUserOnly], async (req, res) => {
    const { saleId } = req.query
    const { email } = req.session.user

    const sale = await Sale.findOne({ _id: saleId })
    const user = await User.findOne({ email: email })

    console.log(user)
    
    console.log(sale, user.balance)
    
    res.render("comfirmPayment", { item: sale, wasFound: !sale? false : true, user })
})

module.exports = Router;
