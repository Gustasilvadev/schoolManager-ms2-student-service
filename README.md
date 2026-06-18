# 🎓 SchoolManager: MS2 - StudentService

## 1. Visão Geral do Projeto
O SchoolManager é um sistema de gestão escolar desenvolvido para digitalizar e acelerar processos administrativos e acadêmicos de escolas. O foco está na produtividade da secretaria e dos professores. 

O sistema possui uma arquitetura baseada em **microsserviços**, utilizando um API Gateway como ponto de entrada (validando tokens gerados por este serviço) e comunicação híbrida (HTTP/REST para requisições síncronas e RabbitMQ para operações assíncronas). O ecossistema completo conta com 6 microsserviços isolados com seus próprios bancos de dados (MariaDB).

---

## 2. Sobre o StudentService (MS2)
Este repositório contém exclusivamente o código do **MS2 - StudentService**. Ele é responsável pela gestão de alunos dentro do ecossistema SchoolManager.

**Domínio:** Alunos e gestão acadêmica básica.

### Responsabilidades Principais
* **Cadastro e Gestão de Alunos:** CRUD completo dos alunos.
* **Armazenamento de Dados:** Informações como nome, identificação e status do aluno.
* **Integração com outros serviços:** Possível vínculo com turmas (ClassesService) e demais módulos acadêmicos.

### Banco de Dados
Este microsserviço possui seu domínio de dados totalmente isolado, utilizando uma instância de **MariaDB** dedicada às tabelas de alunos.

---

## 3. Padrão de Commits

Para mantermos o histórico limpo e rastreável, este projeto utiliza a especificação conforme os exemplos abaixo.

**Formato:** `<tipo>: <mensagem curta>`

**Tipos permitidos:**
- `feat`: Nova funcionalidade (ex: criação de nova rota de login).
- `fix`: Correção de bug (ex: ajuste na expiração do token).
- `chore`: Configurações, dependências e estrutura (ex: setup do banco MariaDB).
- `docs`: Atualização de documentação (ex: melhorias neste README).
- `refactor`: Refatoração de código sem alterar regra de negócio.
- `style`: Formatação de código (linting, prettier).
- `test`: Criação/alteração de testes de segurança ou unitários.

---

# 📡 Endpoints da API

## 🎓 Students

| Método | Endpoint                              | Descrição                          | Auth | Role             | Body |
|--------|---------------------------------------|------------------------------------|------|------------------|------|
| GET    | `/students/listStudents`              | Lista alunos (paginação + filtros). Default ADMIN: ACTIVE+INACTIVE. Use `?includeDeleted=true` ou `?status=N`. | ✅   | ADMIN            | — |
| GET    | `/students/listStudentById/{id}`      | Busca aluno por ID                 | ✅   | ADMIN ou TEACHER | — |
| POST   | `/students/createStudent`             | Cria novo aluno                    | ✅   | ADMIN            | `student_name`, `student_cpf`, `student_email`, `student_birthday`, `student_status?`, `responsibles?` |
| PUT    | `/students/updateStudentById/{id}`    | Atualiza dados do aluno (bloqueado se status=DELETED) | ✅   | ADMIN            | qualquer campo + `responsibles?` |
| DELETE | `/students/deleteStudentById/{id}`    | Deleta aluno (soft, status=2)      | ✅   | ADMIN            | — |
| POST   | `/students/restoreStudentById/{id}`   | Restaura aluno deletado (status: 2 → 1) | ✅   | ADMIN            | — |
| POST   | `/students/uploadPhotoById/{id}`      | Upload da foto do aluno              | ✅   | ADMIN ou TEACHER | `photo` (file, multipart) |

> **`listStudentById` é o único endpoint de leitura aberto a TEACHER**, usado por outros MS (ex.: MS4 ao matricular aluno em turma) via Token Propagation. CRUD completo continua restrito a ADMIN.

### Foto do aluno (`student_photo`)

- O campo `student_photo` (URL pública no **Cloudinary**) é retornado no objeto do aluno (listagens e detalhe). Possui avatar padrão (DEFAULT) no banco.
- Upload via `multipart/form-data`, campo **`photo`**. Limite **5 MB**; formatos **jpeg, jpg, png, webp**. A imagem vai ao Cloudinary direto da memória (sem disco) e a `secure_url` é persistida.
- Permissão: **ADMIN ou TEACHER** (aluno não tem login). Erros: `413` (>5 MB), `400` (formato inválido / sem arquivo / aluno inativo status=2), `503` (Cloudinary indisponível — nada é gravado).

---

## ❤️ Health Check

| Método | Endpoint   | Descrição                  | Auth |
|--------|-----------|---------------------------|------|
| GET    | `/health` | Verifica status da API     | ❌   |

---