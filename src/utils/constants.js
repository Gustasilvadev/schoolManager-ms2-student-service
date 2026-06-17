module.exports = {
  ROLES: {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER'
  },
  STUDENT_STATUS: {
    ACTIVE: 1,
    INACTIVE: 0,
    DELETED: 2
  },
  RESPONSIBLE_STATUS: {
    ACTIVE: 1,
    INACTIVE: 0,
    DELETED: 2
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    PAYLOAD_TOO_LARGE: 413,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  MESSAGES: {
    TOKEN_MISSING: 'Token não fornecido',
    TOKEN_INVALID: 'Token inválido ou expirado',
    FORBIDDEN: 'Acesso negado: permissão insuficiente',
    STUDENT_NOT_FOUND: 'Aluno não encontrado',
    RESPONSIBLE_NOT_FOUND: 'Responsável não encontrado',
    EMAIL_ALREADY_EXISTS: 'E-mail já cadastrado',
    CPF_ALREADY_EXISTS: 'CPF já cadastrado',
    INVALID_CPF: 'CPF inválido',
    BIRTHDAY_INVALID: 'Data de nascimento inválida',
    REQUIRED_FIELD: 'Campo obrigatório não preenchido',
    CANNOT_EDIT_DELETED: 'Não é possível editar um aluno excluído',
    NOT_DELETED_CANNOT_RESTORE: 'O registro não está excluído',
    STUDENT_RESTORED: 'Aluno restaurado com sucesso',
    EXTERNAL_SERVICE_UNAVAILABLE: 'Serviço externo indisponível',
    NO_FILE_PROVIDED: 'Nenhum arquivo de imagem foi enviado',
    INVALID_FILE_TYPE: 'Formato de imagem inválido. Aceitos: JPEG, JPG, PNG e WEBP',
    FILE_TOO_LARGE: 'A imagem excede o tamanho máximo permitido de 5 MB',
    UPLOAD_ERROR: 'Falha ao processar o upload da imagem'
  }
};