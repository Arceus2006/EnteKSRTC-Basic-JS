const express = require("express");
const router = express.Router();
const { getBuses, getBusById, seedBuses } = require("../controllers/busController");

router.get("/", getBuses);
router.get("/:id", getBusById);
router.post("/seed", seedBuses);

module.exports = router;
