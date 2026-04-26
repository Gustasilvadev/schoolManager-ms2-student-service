const prisma = require('../config/prisma');

const findOne = async (studentId, responsibleId) => {
  return await prisma.student_responsibles.findFirst({
    where: { student_id: studentId, responsible_id: responsibleId }
  });
};

const assign = async (studentId, responsibleId) => {
  const existing = await findOne(studentId, responsibleId);
  if (existing) return existing;
  return await prisma.student_responsibles.create({
    data: {
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

const removeAllByStudent = async (studentId) => {
  return await prisma.student_responsibles.deleteMany({
    where: { student_id: studentId }
  });
};

module.exports = {
  assign,
  findByStudent,
  findByResponsible,
  removeAllByStudent
};