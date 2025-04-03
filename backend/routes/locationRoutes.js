const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

router.post("/add-locations", locationController.addLocation);
router.get("/all-locations", locationController.getLocations);

module.exports = router;
