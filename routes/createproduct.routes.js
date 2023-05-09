const { AuthenticatedOnly, BussinessUserOnly } = require("../middleware/Authenticate");
const Sale = require("../model/Sale");
const Router = require("express").Router();
const User = require("../model/User");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

Router.get("/create-product", [AuthenticatedOnly, BussinessUserOnly], async (req, res, next) => {
    const userEmail = req.session.user?.email

    const user = await User.findOne({ email: userEmail });

    res.render("create-product", { user })
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // set the directory where files will be uploaded
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      const filename = buf.toString("hex") + path.extname(file.originalname);
      console.log("Uploaded file:", filename);
      cb(null, filename);
    });
  },
});

const upload = multer({ storage: storage });

Router.post(
  "/create-product",
  [AuthenticatedOnly, upload.single("image")],
  async (req, res, next) => {
    const { name, description, supply, price } = req.body;
    const image = req.file.filename;

    const user = await User.findOne({ email: req.session.user.email })

    // create a new Sale document with the uploaded file and other data
    const sale = new Sale({
      image: image,
      name: name,
      price: price,
      sellerId: user._id,
      supply: supply,
      description: description
    });

    await sale.save();

    res.redirect("/");
  }
);


module.exports = Router

