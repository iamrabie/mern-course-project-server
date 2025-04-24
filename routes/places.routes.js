const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const fileUpload = require('../middlewares/upload-file');
const PlacesController = require("../controllers/places.controller");
const checkAuth = require("../middlewares/validate-token");

router.get("/", PlacesController.getAllPlaces);

router.get("/:pid", PlacesController.getPlaceById);

router.get("/user/:uid", PlacesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/create-place",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    // check("image").not().isEmpty()
  ],
  PlacesController.createPlace
);

router.put("/update-place/:pid", PlacesController.updatePlace);

router.delete("/delete-place/:pid", PlacesController.deletePlace);

module.exports = router;
