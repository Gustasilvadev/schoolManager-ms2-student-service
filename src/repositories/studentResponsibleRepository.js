const prisma = require('../config/prisma');

const assign = async (studentId, responsibleId) => {
  return await prisma.student_responsibles.create({
    data: {
      student_id: studentId,
      responsible_id: responsibleId
    }
  });
};

const remove = async (studentId, responsibleId) => {
  return await prisma.student_responsibles.deleteMany({
    where: {
      student_id: studentId,
      responsible_id: responsibleId
    }
  });
};

const findByStudent = async (studentId) => {
  return await prisma.student_responsibles.findMany({
    where: { student_id: studentId },
    include: { responsible: true }
  });
};

const findByResponsible = async (responsibleId) => {
  return await prisma.student_responsibles.findMany({
    where: { responsible_id: responsibleId },
    include: { student: true }
  });
};

module.exports = {
  assign,
  remove,
  findByStudent,
  findByResponsible
};