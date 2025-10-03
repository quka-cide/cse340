const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")
const validate = require("../utilities/inv-validation")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build details by inventory view
 * ************************** */
invCont.buildByInventoryId = async function(req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getDetailByInventoryId(inventory_id)
  const grid = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()
  const carName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  res.render("./inventory/details", {
    title: carName,
    nav,
    grid,
  })
}

/* **********************
 *  Deliver Management View
 * ********************* */
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
  })
}

/* **********************
 *  Deliver Add Classification View
 * ********************* */
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* **********************
 *  Handle Classification Insert
 * ********************* */
invCont.addClassification = async function(req, res, next) {
  const { classification_name } = req.body
  try {
    const newClass = await invModel.addClassification(classification_name)

    if(newClass) {
      req.flash("notice", "New classification added successfully.")
      return res.redirect("/inv")
    } else {
      req.flash("notice", "Failed to add classification")
      return res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        message: req.flash("notice"),
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

invCont.buildAddInventory = async function(req, res, next) {
  const nav = await utilities.getNav()
  try {
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      message: req.flash("notice"),
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const classificationList = await utilities.buildClassificationList(req.body.classification_id)

      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        classificationList,
        nav,
        message: req.flash("notice"),
        errors: errors.array(),
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail
      })
    }

    const result = await invModel.addInventory(
      req.body.classification_id,
      req.body.inv_make,
      req.body.inv_model,
      req.body.inv_year,
      req.body.inv_description,
      req.body.inv_image,
      req.body.inv_thumbnail,
      req.body.inv_price,
      req.body.inv_miles,
      req.body.inv_color
    )

    if (result) {
      req.flash("notice", "Vehicle added successfully.")
      return res.redirect("/inv")
    }

    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    req.flash("notice", "Failed to add vehicle. Please try again.")
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      nav,
      message: req.flash("notice"),
      errors: null,
      ...req.body
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData.length > 0) {
    if (invData[0].inv_id) {
      return res.json(invData)
    }
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getDetailByInventoryId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getDetailByInventoryId(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("/inv/", {
    title: "Delete Vehicle",
    nav,
    errors: null,
    })
  }
}

module.exports = invCont