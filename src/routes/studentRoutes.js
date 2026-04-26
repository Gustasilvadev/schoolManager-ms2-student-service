const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  validateCreateStudent,
  validateUpdateStudent
} = require('../middlewares/validationMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/listStudents', studentController.getAllStudents);
router.get('/listStudentById/:id', studentController.getStudentById);
router.post('/createStudent', validateCreateStudent, studentController.createStudent);
router.put('/updateStudentById/:id', validateUpdateStudent, studentController.updateStudent);
router.delete('/deleteStudentById/:id', studentController.deleteStudent);

module.exports = router;