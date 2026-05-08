const prisma = require('../config/prisma');
const { STUDENT_STATUS, RESPONSIBLE_STATUS } = require('../utils/constants');

const findByEmail = async (email) => {
  return await prisma.students.findUnique({
    where: { student_email: email }
  });
};

const findByCpf = async (cpf) => {
  if (!cpf) return null;
  return await prisma.students.findFirst({
    where: { student_cpf: cpf }
  });
};

const findById = async (id, tx = prisma) => {
  return await tx.students.findUnique({
    where: { student_id: id },
    include: {
      student_responsibles: {
        include: {
          responsibles: true
        }
      }
    }
  });
};

const findAll = async (skip, take, where = {}) => {
  return await prisma.students.findMany({
    where,
    skip,
    take,
    orderBy: { student_id: 'asc' },
    include: {
      student_responsibles: {
        include: {
          responsibles: true
        }
      }
    }
  });
};

const count = async (where = {}) => {
  return await prisma.students.count({ where });
};

const create = async (studentData, responsibles = []) => {
  return await prisma.$transaction(async (tx) => {
    const newStudent = await tx.students.create({ data: studentData });

    for (const resp of responsibles) {
      let responsibleId = resp.responsible_id;

      if (!responsibleId && resp.responsible_name && resp.responsible_email) {
        let existing = await tx.responsibles.findUnique({
          where: { responsible_email: resp.responsible_email }
        });

        if (!existing) {
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

      if (!responsibleId) {
        throw new Error('Responsável inválido: necessário fornecer responsible_id ou nome+email');
      }

      await tx.student_responsibles.create({
        data: {
          student_id: newStudent.student_id,
          responsible_id: responsibleId
        }
      });
    }

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

const update = async (id, data, tx = prisma) => {
  return await tx.students.update({
    where: { student_id: id },
    data,
    include: {
      student_responsibles: {
        include: {
          responsibles: true
        }
      }
    }
  });
};

const softDelete = async (id) => {
  return await prisma.students.update({
    where: { student_id: id },
    data: { student_status: STUDENT_STATUS.DELETED },
    include: {
      student_responsibles: {
        include: {
          responsibles: true
        }
      }
    }
  });
};

module.exports = {
  findByEmail,
  findByCpf,
  findById,
  findAll,
  count,
  create,
  update,
  softDelete
};