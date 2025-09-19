/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const utilities = require("./utilities")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.use(express.static('public'));
/* ***********************
 * Routes
 *************************/
// nav
app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav()
  next()
})

app.use(static)
// index route
app.get("/", baseController.buildHome)
app.use("/inv", inventoryRoute)

//error route
const errorRoute = require("./routes/errorRoute")
app.use("/error", errorRoute)

// Catch 500 errors
app.use(async (err, req, res, next) => {
  console.error(err.stack)
  const nav = await utilities.getNav()
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: "Oops! Something went wrong on our end. Please try again later.",
    nav
  })
})
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
