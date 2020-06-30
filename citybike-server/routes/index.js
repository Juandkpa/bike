const express = require("express");
const router = express.Router();
const { getDesiredAvailability } = require('../services/station');

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

router.get("/history", async (req, res) => {
    try {
        const { step = 0 } = req.query;

        res.send(await getDesiredAvailability(step));
    } catch(err) {
        res.status(500).send();
        console.log(err.message);
    }

})
module.exports = router;
