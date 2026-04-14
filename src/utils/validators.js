const studentRepo = require('../repositories/studentRepository');
const responsibleRepo = require('../repositories/responsibleRepository');

const validateUniqueStudentEmail = async (email, currentId = null) => {
  const existing = await studentRepo.findByEmail(email);
  if (existing && existing.student_id !== currentId) {
    throw new Error('E-mail já cadastrado');
  }
};

const validateUniqueStudentCpf = async (cpf, currentId = null) => {
  if (!cpf) return;
  const existing = await studentRepo.findByCpf(cpf);
  if (existing && existing.student_id !== currentId) {
    throw new Error('CPF já cadastrado');
  }
};

const validateUniqueResponsibleEmail = async (email, currentId = null) => {
  const existing = await responsibleRepo.findByEmail(email);
  if (existing && existing.responsible_id !== currentId) {
    throw new Error('E-mail já cadastrado');
  }
};

module.exports = {
  validateUniqueStudentEmail,
  validateUniqueStudentCpf,
  validateUniqueResponsibleEmail
};