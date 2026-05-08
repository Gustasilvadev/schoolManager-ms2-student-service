const express = require('express');
const studentRoutes = require('./studentRoutes');

const router = express.Router();

router.use('/students', studentRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'student-service' });
});

module.exports = router;