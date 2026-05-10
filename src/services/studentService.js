const prisma = require('../config/prisma');
const studentRepo = require('../repositories/studentRepository');
const responsibleRepo = require('../repositories/responsibleRepository');
const studentResponsibleRepo = require('../repositories/studentResponsibleRepository');
const { MESSAGES, STUDENT_STATUS, RESPONSIBLE_STATUS, ROLES } = require('../utils/constants');
const { validateUniqueStudentEmail, validateUniqueStudentCpf, validateUniqueResponsibleEmail } = require('../utils/validators');

/**
 * Cria um novo aluno com seus responsáveis.
 */
const createStudent = async (studentData) => {
  const { responsibles = [], ...studentBasicData } = studentData;

  await validateUniqueStudentEmail(studentBasicData.student_email);
  if (studentBasicData.student_cpf) {
    await validateUniqueStudentCpf(studentBasicData.student_cpf);
  }

  if (studentBasicData.student_birthday) {
    studentBasicData.student_birthday = new Date(studentBasicData.student_birthday);
  }

  const newStudentData = {
    student_name: studentBasicData.student_name,
    student_birthday: studentBasicData.student_birthday,
    student_cpf: studentBasicData.student_cpf || null,
    student_email: studentBasicData.student_email,
    student_status: studentBasicData.student_status ?? STUDENT_STATUS.ACTIVE
  };

  return await studentRepo.create(newStudentData, responsibles);
};

/**
 * Lista alunos com paginação e filtros.
 */
const getAllStudents = async (filters = {}, page = 1, limit = 10, userRole = ROLES.ADMIN) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.name && filters.name.trim() !== '') {
    where.student_name = { contains: filters.name };
  }
  if (filters.cpf && filters.cpf.trim() !== '') {
    where.student_cpf = { contains: filters.cpf };
  }
  if (filters.email && filters.email.trim() !== '') {
    where.student_email = { contains: filters.email };
  }
  if (userRole === ROLES.TEACHER) {
    where.student_status = STUDENT_STATUS.ACTIVE;
  } else if (filters.status !== undefined && filters.status !== '') {
    where.student_status = parseInt(filters.status);
  } else if (filters.includeDeleted !== true) {
    where.student_status = { in: [STUDENT_STATUS.ACTIVE, STUDENT_STATUS.INACTIVE] };
  }

  const students = await studentRepo.findAll(skip, limit, where);
  const total = await studentRepo.count(where);
  return { students, total, page, limit };
};

/**
 * Busca aluno por ID.
 */
const getStudentById = async (id) => {
  const student = await studentRepo.findById(id);
  if (!student) throw new Error(MESSAGES.STUDENT_NOT_FOUND);
  return student;
};

/**
 * Atualiza dados de um aluno e sua lista de responsáveis (se fornecida, substitui a existente)
 */
const updateStudent = async (id, updateData) => {
  const existing = await studentRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.STUDENT_NOT_FOUND);
  if (existing.student_status === STUDENT_STATUS.DELETED) {
    throw new Error(MESSAGES.CANNOT_EDIT_DELETED);
  }

  const { responsibles, ...studentUpdateData } = updateData;

  if (Object.keys(studentUpdateData).length > 0) {
    if (studentUpdateData.student_email) {
      await validateUniqueStudentEmail(studentUpdateData.student_email, id);
    }
    if (studentUpdateData.student_cpf) {
      await validateUniqueStudentCpf(studentUpdateData.student_cpf, id);
    }
    if (studentUpdateData.student_birthday) {
      studentUpdateData.student_birthday = new Date(studentUpdateData.student_birthday);
    }
  }

  return await prisma.$transaction(async (tx) => {
    if (Object.keys(studentUpdateData).length > 0) {
      await studentRepo.update(id, studentUpdateData, tx);
    }

    if (responsibles !== undefined) {
      await studentResponsibleRepo.removeAllByStudent(id, tx);

      for (const resp of responsibles) {
        let responsibleId = resp.responsible_id;
        if (!responsibleId && resp.responsible_name && resp.responsible_email) {
          let existingResp = await responsibleRepo.findByEmail(resp.responsible_email, tx);
          if (!existingResp) {
            existingResp = await responsibleRepo.create({
              responsible_name: resp.responsible_name,
              responsible_email: resp.responsible_email,
              responsible_status: resp.responsible_status ?? RESPONSIBLE_STATUS.ACTIVE
            }, tx);
          }
          responsibleId = existingResp.responsible_id;
        }
        if (responsibleId) {
          await studentResponsibleRepo.assign(id, responsibleId, tx);
        } else {
          throw new Error('Responsável inválido na atualização');
        }
      }
    }

    return await studentRepo.findById(id, tx);
  });
};

/**
 * Exclusão lógica do aluno.
 */
const deleteStudent = async (id) => {
  const student = await studentRepo.findById(id);
  if (!student) throw new Error(MESSAGES.STUDENT_NOT_FOUND);
  return await studentRepo.softDelete(id);
};

const restoreStudent = async (id) => {
  const student = await studentRepo.findById(id);
  if (!student) throw new Error(MESSAGES.STUDENT_NOT_FOUND);
  if (student.student_status !== STUDENT_STATUS.DELETED) {
    throw new Error(MESSAGES.NOT_DELETED_CANNOT_RESTORE);
  }
  return await studentRepo.restore(id);
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  restoreStudent
};