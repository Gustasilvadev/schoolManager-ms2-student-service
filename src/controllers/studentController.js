const studentService = require('../services/studentService');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const { formatStudentResponse, formatStudentsArray } = require('../utils/formatterResponse');

/**
 * Cria um novo aluno (apenas ADMIN)
 */
const createStudent = async (req, res, next) => {
  try {
    const studentData = {
      student_name: req.body.student_name,
      student_birthday: req.body.student_birthday,
      student_cpf: req.body.student_cpf,
      student_email: req.body.student_email,
      student_status: req.body.student_status,
      responsibles: req.body.responsibles
    };
    const newStudent = await studentService.createStudent(studentData);
    return res.status(HTTP_STATUS.CREATED).json(formatStudentResponse(newStudent));
  } catch (error) {
    if (error.message === MESSAGES.EMAIL_ALREADY_EXISTS || error.message === MESSAGES.CPF_ALREADY_EXISTS) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Lista alunos com paginação e filtros (apenas ADMIN)
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, cpf, email, status } = req.query;
    const filters = {};
    if (name) filters.name = name;
    if (cpf) filters.cpf = cpf;
    if (email) filters.email = email;
    if (status !== undefined) filters.status = parseInt(status);

    const result = await studentService.getAllStudents(filters, parseInt(page), parseInt(limit));
    return res.status(HTTP_STATUS.OK).json({
      students: formatStudentsArray(result.students),
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Busca aluno por ID (apenas ADMIN)
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(parseInt(id));
    return res.status(HTTP_STATUS.OK).json(formatStudentResponse(student));
  } catch (error) {
    if (error.message === MESSAGES.STUDENT_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Atualiza dados do aluno (apenas ADMIN)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.student_name !== undefined) updateData.student_name = req.body.student_name;
    if (req.body.student_birthday !== undefined) updateData.student_birthday = req.body.student_birthday;
    if (req.body.student_cpf !== undefined) updateData.student_cpf = req.body.student_cpf;
    if (req.body.student_email !== undefined) updateData.student_email = req.body.student_email;
    if (req.body.student_status !== undefined) updateData.student_status = req.body.student_status;

    const updated = await studentService.updateStudent(parseInt(id), updateData);
    return res.status(HTTP_STATUS.OK).json(formatStudentResponse(updated));
  } catch (error) {
    if (error.message === MESSAGES.STUDENT_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    if (error.message === MESSAGES.EMAIL_ALREADY_EXISTS || error.message === MESSAGES.CPF_ALREADY_EXISTS) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Exclusão lógica do aluno (apenas ADMIN)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await studentService.deleteStudent(parseInt(id));
    return res.status(HTTP_STATUS.OK).json(formatStudentResponse(deleted));
  } catch (error) {
    if (error.message === MESSAGES.STUDENT_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Associa um responsável a um aluno (apenas ADMIN)
 */
const associateResponsible = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);
    const { responsible_id } = req.body;
    const association = await studentService.associateResponsible(studentId, responsible_id);
    return res.status(HTTP_STATUS.CREATED).json(association);
  } catch (error) {
    if (error.message === MESSAGES.STUDENT_NOT_FOUND || error.message === MESSAGES.RESPONSIBLE_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Remove associação entre aluno e responsável (apenas ADMIN)
 */
const removeResponsibleAssociation = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);
    const responsibleId = parseInt(req.params.responsibleId);
    await studentService.removeResponsibleAssociation(studentId, responsibleId);
    return res.status(HTTP_STATUS.OK).json({ message: 'Associação removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todos os responsáveis de um aluno (apenas ADMIN)
 */
const getResponsiblesByStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);
    const responsibles = await studentService.getResponsiblesByStudent(studentId);
    return res.status(HTTP_STATUS.OK).json(responsibles);
  } catch (error) {
    if (error.message === MESSAGES.STUDENT_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  associateResponsible,
  removeResponsibleAssociation,
  getResponsiblesByStudent
};