// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validate = require("../utilities/inv-validation")
const { validationResult } = require("express-validator")



// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build detail by inventory view
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get("/", utilities.checkAccountType, invController.buildManagement)
// Show add-classification form
router.get("/add-classification", utilities.checkAccountType, invController.buildAddClassification)

// Process add-classification form
router.post(
  "/add-classification",
  utilities.checkAccountType,
  validate.classificationRules(),
  invController.addClassification
)

// show add-inventory form
router.get("/add-inventory", utilities.checkAccountType, invController.buildAddInventory)
// process add-inventory
router.post("/add-inventory", utilities.checkAccountType, validate.inventoryRules(), invController.addInventory)
router.get("/getInventory/:classification_id", utilities.checkAccountType, invController.getInventoryJSON)
// edit view
router.get("/edit/:inv_id", utilities.checkAccountType, invController.editInventoryView)
router.post("/update/", utilities.checkAccountType, invController.updateInventory)
// delete view
router.get("/delete/:inv_id", utilities.checkAccountType, invController.deleteInventoryView)
router.post("/delete/", utilities.checkAccountType, invController.deleteInventory)

module.exports = router;