const studentRepo = require('../repositories/studentRepository');
const responsibleRepo = require('../repositories/responsibleRepository');
const studentResponsibleRepo = require('../repositories/studentResponsibleRepository');
const { MESSAGES, STUDENT_STATUS, RESPONSIBLE_STATUS } = require('../utils/constants');
const { validateUniqueStudentEmail, validateUniqueStudentCpf, validateUniqueResponsibleEmail } = require('../utils/validators');
const prisma = require('../config/prisma');

/**
 * Cria um novo aluno com seus responsáveis.
 */
const createStudent = async (studentData) => {
  const { responsibles = [], ...studentBasicData } = studentData;

  // Validações
  await validateUniqueStudentEmail(studentBasicData.student_email);
  if (studentBasicData.student_cpf) {
    await validateUniqueStudentCpf(studentBasicData.student_cpf);
  }

  // Converte data
  if (studentBasicData.student_birthday) {
    studentBasicData.student_birthday = new Date(studentBasicData.student_birthday);
  }

  const studentStatus = studentBasicData.student_status ?? STUDENT_STATUS.ACTIVE;

  // Transação
  return await prisma.$transaction(async (tx) => {
    // 1. Cria o aluno
    const newStudent = await tx.students.create({
      data: {
        student_name: studentBasicData.student_name,
        student_birthday: studentBasicData.student_birthday,
        student_cpf: studentBasicData.student_cpf || null,
        student_email: studentBasicData.student_email,
        student_status: studentStatus
      }
    });

    // 2. Processa responsáveis
    for (const resp of responsibles) {
      let responsibleId = resp.responsible_id;

      if (!responsibleId && resp.responsible_name && resp.responsible_email) {
        // Tenta encontrar responsável pelo email
        let existing = await tx.responsibles.findUnique({
          where: { responsible_email: resp.responsible_email }
        });

        if (!existing) {
          // Cria novo responsável
          existing = await tx.responsibles.create({
            data: {
              responsible_name: resp.responsible_name,
              responsible_email: resp.responsible_email,
              responsible_status: resp.responsible_status ?? RESPONSIBLE_STATUS.ACTIVE
            }
          });
        }
        responsibleId = existing.responsible_id;
      }

      if (responsibleId) {
        // Cria associação
        await tx.student_responsibles.create({
          data: {
            student_id: newStudent.student_id,
            responsible_id: responsibleId
          }
        });
      } else {
        throw new Error('Responsável inválido: necessário fornecer responsible_id ou nome+email');
      }
    }

    // 3. Retorna o aluno com os responsáveis incluídos
    return await tx.students.findUnique({
      where: { student_id: newStudent.student_id },
      include: {
        student_responsibles: {
          include: { responsibles: true }
        }
      }
    });
  });
};

/**
 * Lista alunos com paginação e filtros.
 */
const getAllStudents = async (filters = {}, page = 1, limit = 10) => {
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
  if (filters.status !== undefined && filters.status !== '') {
    where.student_status = parseInt(filters.status);
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
 * Atualiza dados de um aluno e sua lista de responsáveis.
 * Se a lista de responsáveis for fornecida, substitui completamente a existente.
 */
const updateStudent = async (id, updateData) => {
  const existing = await studentRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.STUDENT_NOT_FOUND);

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
    await studentRepo.update(id, studentUpdateData);
  }


  if (responsibles !== undefined) {
    await studentResponsibleRepo.removeAllByStudent(id);

    for (const resp of responsibles) {
      let responsibleId = resp.responsible_id;
      if (!responsibleId && resp.responsible_name && resp.responsible_email) {
        let existingResp = await responsibleRepo.findByEmail(resp.responsible_email);
        if (!existingResp) {
          await validateUniqueResponsibleEmail(resp.responsible_email);
          existingResp = await responsibleRepo.create({
            responsible_name: resp.responsible_name,
            responsible_email: resp.responsible_email,
            responsible_status: resp.responsible_status ?? RESPONSIBLE_STATUS.ACTIVE
          });
        }
        responsibleId = existingResp.responsible_id;
      }
      if (responsibleId) {
        await studentResponsibleRepo.assign(id, responsibleId);
      } else {
        throw new Error('Responsável inválido na atualização');
      }
    }
  }

  return await studentRepo.findById(id);
};

/**
 * Exclusão lógica do aluno.
 */
const deleteStudent = async (id) => {
  const student = await studentRepo.findById(id);
  if (!student) throw new Error(MESSAGES.STUDENT_NOT_FOUND);
  await studentRepo.softDelete(id);
  return true;
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};