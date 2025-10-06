const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("../views/account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("../views/account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("../views/account/management", {
        title: "Management",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ***************************
 *  Build Update Account form
 * ************************** */
async function buildUpdateAccount(req, res, next) {
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account Information",
    accountData
  })
}

/* ***************************
 *  Process Update Account
 * ************************** */
async function updateAccount(req, res, next) {
  const {account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if(updateResult) {
    req.flash("notice", "Account updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Update failed. Try again.")
    return res.redirect("/account/update/" + account_id)
  }
}

/* ***************************
 *  Change Password
 * ************************** */
async function updatePassword(req, res, next) {
  const { account_id, account_password } = req.body
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    await accountModel.updatePassword(account_id, hashedPassword)

    req.flash("notice", "Password changed successfully.")
    res.redirect("/account/")
  } catch(error) {
    console.error("updatePassword error:", error)
    req.flash("notice", "Password update failed. Please try again.")
    res.redirect("/account/update/" + account_id)
  }
}

/* ***************************
 *  Logout
 * ************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}
 
module.exports = {
  buildLogin,
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement, 
  buildUpdateAccount, 
  updateAccount,
  updatePassword,
  logout
}