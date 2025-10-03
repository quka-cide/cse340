const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accValidate = require("../utilities/account-validation")
const validate = require("../utilities/inv-validation")

router.get("/login", accountController.buildLogin)
router.get("/register", accountController.buildRegister)
router.post(
  "/register",
  accValidate.registationRules(),
  accValidate.checkRegData,
  accountController.registerAccount
)
router.post(
  "/login",
  accValidate.loginRules(),
  accValidate.checkRegData,
  accountController.accountLogin
)
router.get("/", utilities.checkLogin, accountController.buildManagement)

// show update account form
router.get("/update/:account_id",  utilities.checkLogin, accountController.buildUpdateAccount)
router.post(
  "/update", 
  accValidate.updateAccountRules(), 
  utilities.checkLogin,
  accountController.updateAccount,
)
router.post(
  "/update-password", 
  accValidate.checkPasswordData,
  utilities.checkLogin, 
  accountController.updatePassword
)

// Logout route
router.get("/logout", accountController.logout)


module.exports = router