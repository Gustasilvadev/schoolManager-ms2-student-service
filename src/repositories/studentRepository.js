const prisma = require('../config/prisma');
const { STUDENT_STATUS } = require('../utils/constants');

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

const findById = async (id) => {
  return await prisma.students.findUnique({
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
    orderBy: { student_id: 'asc' }
  });
};

const count = async (where = {}) => {
  return await prisma.students.count({ where });
};

const create = async (data) => {
  return await prisma.students.create({ data });
};

const update = async (id, data) => {
  return await prisma.students.update({
    where: { student_id: id },
    data
  });
};

const softDelete = async (id) => {
  return await prisma.students.update({
    where: { student_id: id },
    data: { student_status: STUDENT_STATUS.DELETED }
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