# Blog API (NestJS) ✅

API REST para um Blog construída com NestJS e TypeScript. Implementa autenticação via JWT armazenado em cookie httpOnly, gerenciamento de usuários, posts com status (DRAFT / PUBLISHED), autorização por autor, tratamento de erros consistente e práticas REST modernas.

---

## Stack principal 🔧

- **Linguagem:** TypeScript (Node.js)
- **Framework:** NestJS
- **Banco de dados:** PostgreSQL
- **ORM:** TypeORM
- **Autenticação:** JWT (via cookie httpOnly) com `@nestjs/jwt` + `cookie-parser`
- **Validação:** `class-validator`
- **Hash de senha:** `bcrypt`
- **Testes:** Jest + Supertest

---

## Visão geral da arquitetura & decisões técnicas 💡

- Projeto modular com separação por domínio (Auth, User, Post, Comment).
- JWT como token de acesso guardado em **cookie httpOnly** (nome: `jwt`) — evita exposição em JavaScript; cookie configurado com `Secure`/`SameSite` condicional em produção.
- TypeORM com `synchronize: true` para desenvolvimento (não recomendado em produção). Em produção usar migrations e CI/CD.
- Autorização implementada por checagens no serviço de domínio (ex.: somente o autor pode editar/deletar um post) — claro, poderíamos extrair Guards/Policies para escalar.
- Tratamento de erros usando exceções do Nest (`NotFoundException`, `ForbiddenException`, `UnauthorizedException`) — resposta consistente para clientes.
- CORS habilitado para `http://localhost:4200` com `credentials: true` para suportar cookies.

---

## Como rodar localmente 🚀

### Pré-requisitos

- Node.js (>= 18)
- npm ou yarn
- PostgreSQL

### Variáveis de ambiente (exemplo `.env`)

```
# servidor
PORT=3000
NODE_ENV=development

# jwt
JWT_SECRET=uma_chave_super_secreta

# postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=blogdb
```

## Docker 🐳

### Usando Docker Compose (recomendado)

O projeto inclui configuração Docker para facilitar o desenvolvimento. O Docker Compose sobe a API e o banco PostgreSQL automaticamente.

#### Pré-requisitos
- Docker
- Docker Compose

#### Executar com Docker

```bash
# Subir a aplicação e o banco de dados
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v
A API estará disponível em http://localhost:3000 e o PostgreSQL na porta 5432.
Variáveis de ambiente para Docker
Crie um arquivo .env na raiz do projeto (use .env.example como base):
# servidor
PORT=3000
NODE_ENV=development

# jwt
JWT_SECRET=uma_chave_super_secreta

# postgres (usar nome do serviço docker como host)
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=blogdb

> **⚠️ Produção:** defina `NODE_ENV=production`, desative `synchronize` em TypeORM e use migrations.

### Instalação e execução

```bash
# instalar dependências
npm install

# rodar em modo dev (watch)
npm run start:dev

# build para produção
npm run build
npm run start:prod

# testes
npm run test
npm run test:e2e
```

---

## Fluxo de autenticação (JWT + cookie) 🔐

1. O cliente envia as credenciais (email + password) para `POST /auth/login`.
2. Se as credenciais são válidas, o servidor gera um **JWT** (expira em 1h) e o envia em um cookie `jwt` com `HttpOnly` e `Secure` (em produção).
3. Em requests subsequentes, o cookie é automaticamente enviado pelo navegador; o servidor valida o token para identificar o usuário.
4. Logout: `POST /auth/logout` limpa o cookie.

> **Observação:** em ambientes com front-end separado, habilitar `credentials: true` no fetch/axios e configurar `SameSite`/`Secure` conforme produção.

---

## Modelos principais (resumido) 🧾

### User

- **id**: number
- **username**: string (único)
- **email**: string (único)
- **passwordHash**: string (armazenado, não expor em responses)
- **createdAt**: Date

### Post

- **id**: number
- **title**: string
- **content**: string (text)
- **status**: enum (`draft` | `published`)
- **author**: User (relação ManyToOne)
- **createdAt**: Date

---

## Endpoints (documentação por recurso) 📚

> Observação: Endpoints que requerem autenticação esperam o cookie `jwt` enviado automaticamente.

### Auth

| Método |            Rota | Descrição                                               |    Autenticação    |
| ------ | --------------: | ------------------------------------------------------- | :----------------: |
| POST   |   `/auth/login` | Faz login com `{ email, password }` e seta cookie `jwt` |        Não         |
| POST   |  `/auth/logout` | Limpa o cookie `jwt`                                    |        Não         |
| GET    | `/auth/profile` | Retorna `{ user, data }` (payload do token + user)      | Sim (cookie `jwt`) |

Exemplo: POST /auth/login

Request:

```json
{
  "email": "alice@example.com",
  "password": "senha_segura"
}
```

Response (200): sets cookie `jwt` (httpOnly)

```json
{ "message": "Successfully logged in" }
```

---

### User

| Método |        Rota | Descrição                                               | Autenticação |
| ------ | ----------: | ------------------------------------------------------- | :----------: |
| POST   |     `/user` | Registra novo usuário (`username`, `email`, `password`) |     Não      |
| GET    |     `/user` | Lista usuários                                          |     Não      |
| GET    | `/user/:id` | Recupera usuário por id                                 |     Não      |
| PATCH  | `/user/:id` | Atualiza usuário (parcial)                              |     Não      |
| DELETE | `/user/:id` | Remove usuário                                          |     Não      |

---

### Post

| Método |        Rota | Descrição                                                                 | Autenticação |
| ------ | ----------: | ------------------------------------------------------------------------- | :----------: |
| POST   |     `/post` | Cria post (campos: `title`, `content`) — atribuído ao usuário autenticado |     Sim      |
| GET    |     `/post` | Lista posts **publicados** (`status = published`)                         |     Não      |
| GET    | `/post/:id` | Recupera post publicado por id                                            |     Não      |
| PATCH  | `/post/:id` | Atualiza post (inclui `status` para publicar) — somente autor             |     Sim      |
| DELETE | `/post/:id` | Remove post — somente autor                                               |     Sim      |

Exemplo: Atualizar status para publicar

Request PATCH `/post/1`

```json
{
  "status": "published"
}
```

Response (200): objeto do post atualizado

---

### Comment (coment)

| Método |               Rota | Descrição                               | Autenticação |
| ------ | -----------------: | --------------------------------------- | :----------: |
| POST   | `/comment/:postId` | Cria comentário em post                 |     Sim      |
| GET    |         `/comment` | Lista comentários (requer autenticação) |     Sim      |
| GET    |     `/comment/:id` | Recupera comentário                     |     Sim      |
| PATCH  |     `/comment/:id` | Atualiza comentário — somente autor     |     Sim      |
| DELETE |     `/comment/:id` | Remove comentário — somente autor       |     Sim      |

---

## Padrão de erros da API ⚠️

Erros usam o padrão do NestJS (HTTP Exceptions). Exemplos:

- Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Post with id 1 not found",
  "error": "Not Found"
}
```

- Unauthorized (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

- Bad Request (400)

```json
{
  "statusCode": 400,
  "message": "User alredy exists",
  "error": "Bad Request"
}
```

---

## Exemplos de uso (curl) 🧪

Login:

```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"senha_segura"}' \
  -c cookies.txt
```

Obter profile (enviar cookie):

```bash
curl -i http://localhost:3000/auth/profile -b cookies.txt
```

Criar post (autenticado):

```bash
curl -i -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu post","content":"Conteúdo"}' \
  -b cookies.txt
```

---

## Boas práticas aplicadas

- Recursos RESTful e verbos HTTP corretos
- Uso de DTOs + `class-validator` para validação de entrada
- Autorização aplicada no serviço de domínio (somente autor altera/removem)
- Cookies httpOnly para reduzir risco de XSS

---

## Melhoria e roadmap (futuro) ✨

- Remover `passwordHash` das respostas serializando entidades ou usando DTOs de saída
- Suporte a refresh tokens ou estratégia segura de expiração
- Adicionar paginação e filtros (limit/offset, por autor, por status)
- Migrations e pipeline de deploy com rollback
- Rate limiting, logging estruturado (ex: Winston/pino), observability
- Testes de integração mais completos e coverage para caminhos de erro

---

## Contato / Contribuição

Contribuições são bem-vindas. Abra issues/PRs com descrição clara do problema e testes quando aplicável.

---

**Status:** pronto para uso local / base para produção com configurações e hardening adicionais.
