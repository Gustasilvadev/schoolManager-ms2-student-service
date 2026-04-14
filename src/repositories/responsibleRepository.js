const prisma = require('../config/prisma');

const findByEmail = async (email) => {
  return await prisma.responsibles.findUnique({
    where: { responsible_email: email }
  });
};

const findById = async (id) => {
  return await prisma.students.findUnique({
    where: { student_id: id },
    include: {
      student_responsibles: {
        include: { responsibles: true }
      }
    }
  });
};

const findAll = async (skip, take, where = {}) => {
  return await prisma.responsibles.findMany({
    where,
    skip,
    take,
    orderBy: { responsible_id: 'asc' }
  });
};

const count = async (where = {}) => {
  return await prisma.responsibles.count({ where });
};

const create = async (data) => {
  return await prisma.responsibles.create({ data });
};

const update = async (id, data) => {
  return await prisma.responsibles.update({
    where: { responsible_id: id },
    data
  });
};

const softDelete = async (id) => {
  return await prisma.responsibles.update({
    where: { responsible_id: id },
    data: { responsible_status: 2 }
  });
};

module.exports = {
  findByEmail,
  findById,
  findAll,
  count,
  create,
  update,
  softDelete
};