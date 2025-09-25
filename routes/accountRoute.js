const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get("/login", accountController.buildLogin)
router.get("/register", accountController.buildRegister)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  accountController.registerAccount
)
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router