// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const validate = require("../utilities/inv-validation")
const { validationResult } = require("express-validator")



// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build detail by inventory view
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get("/", invController.buildManagement)
// Show add-classification form
router.get("/add-classification", invController.buildAddClassification)

// Process add-classification form
router.post(
  "/add-classification",
  validate.classificationRules(),
  invController.addClassification
)

// show add-inventory form
router.get("/add-inventory", invController.buildAddInventory)
// process add-inventory
router.post("/add-inventory", validate.inventoryRules(), invController.addInventory)

router.get("/getInventory/:classification_id", invController.getInventoryJSON)
// modify view
router.get("/edit/:inv_id", invController.editInventoryView)
router.post("/update/", invController.updateInventory)

module.exports = router;