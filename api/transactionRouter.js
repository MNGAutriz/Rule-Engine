const express = require('express');
const router = express.Router();
const runRules = require('../engine/rule-runner');

router.post('/interactions', async (req, res) => {
  try {
    const result = await runRules(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Rule evaluation failed', details: err.message });
  }
});

module.exports = router;
