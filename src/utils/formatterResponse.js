/**
 * Formata a resposta do aluno removendo campos desnecessários da tabela auxiliar
 */
const formatStudentResponse = (student) => {
  if (!student) return student;

  return {
    student_id: student.student_id,
    student_name: student.student_name,
    student_birthday: student.student_birthday,
    student_cpf: student.student_cpf,
    student_email: student.student_email,
    student_status: student.student_status,
    student_responsibles: student.student_responsibles?.map(sr => ({
      responsibles: sr.responsibles
    })) || []
  };
};

/**
 * Formata um array de alunos
 */
const formatStudentsArray = (students) => {
  if (!Array.isArray(students)) return students;
  return students.map(formatStudentResponse);
};

module.exports = {
  formatStudentResponse,
  formatStudentsArray
};
