const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  validateCreateStudent,
  validateUpdateStudent
} = require('../middlewares/validationMiddleware');
const { handlePhotoUpload } = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

const ADMIN_ONLY = roleMiddleware(['ADMIN']);
const ADMIN_OR_TEACHER = roleMiddleware(['ADMIN', 'TEACHER']);

router.get('/listStudents', ADMIN_ONLY, studentController.getAllStudents);
router.get('/listStudentById/:id', ADMIN_OR_TEACHER, studentController.getStudentById);
router.post('/createStudent', ADMIN_ONLY, validateCreateStudent, studentController.createStudent);
router.put('/updateStudentById/:id', ADMIN_ONLY, validateUpdateStudent, studentController.updateStudent);
router.post('/uploadPhotoById/:id', ADMIN_OR_TEACHER, handlePhotoUpload, studentController.uploadStudentPhoto);
router.delete('/deleteStudentById/:id', ADMIN_ONLY, studentController.deleteStudent);
router.post('/restoreStudentById/:id', ADMIN_ONLY, studentController.restoreStudent);

module.exports = router;
