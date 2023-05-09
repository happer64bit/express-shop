const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const bodyParser = require("body-parser");
require("dotenv").config();

const IndexRouter = require("./routes/index.routes")
const AccountRouter = require("./routes/account.routes");
const CreateProductRouter = require("./routes/createproduct.routes");
const BussinessRouter = require("./routes/bussiness.routes");

const store = new MongoDBStore({
    uri: process.env.DATABASE_URL,
    collection: 'sessions'
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, done) {
        prisma.user.findUnique({ where: { email } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect email or password.' });
                }
                bcrypt.compare(password, user.password, (_, res) => {
                    if (res) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect email or password.' });
                    }
                });
            })
            .catch(err => done(err));
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    prisma.user.findUnique({ where: { id } })
        .then(user => done(null, user))
        .catch(err => done(err));
});

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 60 * 1000
    },
    store: store
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.set("view engine", "ejs");

app.use(express.static("./public"));

app.use("/", IndexRouter);
app.use("/account", AccountRouter);
app.use("/", CreateProductRouter)
app.use("/", BussinessRouter)

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected Successfully")).catch((e) => console.log(e));

app.listen(5000, () => {});
