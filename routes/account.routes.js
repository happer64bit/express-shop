const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("./../model/User");
const Profile = require("./../model/Profile");
const { NoneAuthenticatedOnly, AuthenticatedOnly } = require("../middleware/Authenticate");

Router.get("/login", [NoneAuthenticatedOnly], (req, res) => {
    res.render("account/login", { message : req.flash('error') });
});

Router.get("/register", [NoneAuthenticatedOnly], (req, res) => {
    res.render("account/register", { message : req.flash('error') });
});

Router.post("/register", [NoneAuthenticatedOnly],async (req, res, next) => {
    try {
        const { username, email, password, accountType } = req.body;

        console.log(req.body);
        if (!username || !email || !password || !accountType) {
            req.flash("error", "Form Required");
            return res.redirect(req.header('Referer'));
        }

        if (accountType !== "personal" && accountType !== "bussiness") {
            req.flash("error", "Error with account type");
            return res.redirect(req.header('Referer'));
        }

        const isEmailExist = await User.findOne({ email });

        const isUsernameExist = await User.findOne({ username });

        if (isEmailExist || isUsernameExist) {
            req.flash(
                "error",
                isEmailExist ? "Email is already exists" : "Username is already exists"
            );
            console.log(isEmailExist ? "Email is already exists" : "Username is already exists")
            return res.redirect(req.header('Referer'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            username: username.toLowerCase(),
            password: hashedPassword,
            accountType,
            balance: 0
        });

        console.log(newUser)

        await newUser.save();

        const newProfile = new Profile({
            email,
            bio: "There's no bio",
            displayName: username,
            profileImage: "null",
            totalSale: 0,
        });

        console.log(newProfile)

        await newProfile.save();
        req.session.isAuthenticated = true;
        req.session.user = {
            id: newUser._id,
            email: newUser.email,
            password: newUser.password
        }
        return res.redirect("/");
        
    } catch (error) {
        next(error);
    }
});

Router.post("/login", [NoneAuthenticatedOnly],async (req, res, next) => {
    try {
        const { email, password } = req.body

        console.log(req.body)

        const user = await User.findOne({ email })

        if(!user) {
            req.flash(
                "error",
                "user doesn\'t exists"
            );
            res.status(401).redirect(req.header('Referer'));
            return;
        }

        console.log("Checking isPasswordVaild")
        const isPasswordVaild = await bcrypt.compareSync(password, user.password)

        if(!isPasswordVaild) {
            req.flash(
                "error",
                "Wrong Password"
            );
            res.status(401).redirect(req.header('Referer'));
            return;
        }

        req.session.isAuthenticated = true;

        req.session.user = {
            id: user._id,
            email: user.email,
            password: user.password
        }

        res.status(200).redirect("/")
    } catch( error ) {
        next(error)
    }
})

Router.get("/logout", [AuthenticatedOnly],(req, res, next) => {
    try {
        req.logout((err) => {
            if(err) next(err)
            req.session.isAuthenticated = false
            res.redirect("/account/login")
        })
    } catch(err) {
        next(err)
    }
})

Router.get("/profile", [AuthenticatedOnly], async (req, res, next) => {
    try {
        const { email } = req.session.user
        const profile = await Profile.findOne({ email })
        const user = await User.findOne({ email })
        res.render("account/profile", { profile: profile, user: user })
    } catch(err) {
        next(err)
    }
})

Router.post("/profile/edit", [AuthenticatedOnly], async (req, res, next) => {
    try {
        const  { displayName, bio } = req.body;

        if(!displayName || !bio) {
            res.redirect("/account/profile")
        }

        await Profile.findOneAndUpdate(
            {
                email: req.session.user.email
            },
            {
                displayName, bio
            },
            {
                new: true
            }
        )
        res.redirect("/account/profile")

    } catch(err) {
        next(err)
    }
})

module.exports = Router;
