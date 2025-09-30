const utilities = require("./index")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}
const thisYear = new Date().getFullYear()

validate.classificationRules = () => {
  return [
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name may only contain letters and numbers (no spaces or special characters).")
  ]
}

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: thisYear })
      .withMessage(`Year must be between 1900 and ${thisYear}.`),
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),
    body("inv_image")
      .trim()
      .optional({ checkFalsy: true }),
    body("inv_thumbnail")
      .trim()
      .optional({ checkFalsy: true }),
  ]
}

/*  **************************
 *  Check data and return errors for update inventory
 * ************************* */
validate.checkUpdateData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_id
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const itemName = `${inv_make} ${inv_model}`
    res.render("./inventory/edit-inventory", {
      errors,
      title: `Edit ${itemName}`,
      nav,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_id
    })
    return
  }
  next()
}

module.exports = validate