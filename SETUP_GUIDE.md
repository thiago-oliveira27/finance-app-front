# Guia de Integracao - Frontend + Backend + PostgreSQL

## Arquitetura

```
Frontend (Next.js :3000)  -->  proxy /api/*  -->  Backend (Spring Boot :8080)  -->  PostgreSQL (:5432)
```

O Next.js usa `rewrites` no `next.config.mjs` para redirecionar todas as chamadas `/api/*` para o backend Java, evitando problemas de CORS.

---

## Passo 1: Instalar PostgreSQL

### Windows
1. Baixe em: https://www.postgresql.org/download/windows/
2. Execute o instalador e anote a **senha do usuario postgres**
3. A porta padrao e `5432`

### Mac
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## Passo 2: Criar o Banco de Dados

Abra o terminal do PostgreSQL:

```bash
# Windows: use o pgAdmin ou o SQL Shell (psql) que vem na instalacao
# Mac/Linux:
sudo -u postgres psql
```

Execute:

```sql
CREATE DATABASE finance;
```

Para verificar:
```sql
\l
```

Voce deve ver `finance` na lista. Para sair: `\q`

### Configurar senha (se necessario)

O backend usa usuario `postgres` com senha `thiago` (definido no `application.yaml`).
Se sua senha e diferente, altere no backend em:

```
src/main/resources/application.yaml
```

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/finance
    username: postgres
    password: SUA_SENHA_AQUI    # <-- altere aqui
```

---

## Passo 3: Rodar o Backend

### Pre-requisitos
- Java 17+ instalado (`java -version` para verificar)
- Maven instalado (`mvn -version` para verificar)

### Executar

```bash
# Clone o backend (se ainda nao fez)
git clone https://github.com/TiagoCypriano/finance-app-back.git
cd finance-app-back

# Rodar com Maven
mvn spring-boot:run
```

Ou se preferir gerar o JAR:
```bash
mvn clean package -DskipTests
java -jar target/finance-0.0.1-SNAPSHOT.jar
```

### Verificar se esta rodando

Abra o navegador e acesse:
```
http://localhost:8080/api/auth/login
```

Voce deve receber um erro 405 (Method Not Allowed) ou similar - isso significa que o servidor esta rodando! (O endpoint espera POST, nao GET)

### O banco e criado automaticamente!

O backend usa `ddl-auto: update`, entao a tabela `usuarios` e criada automaticamente quando o Spring Boot inicia. Nao precisa rodar SQL manual.

---

## Passo 4: Rodar o Frontend

```bash
# No diretorio do frontend
cd finance-app-front

# Instalar dependencias
npm install

# Rodar em modo desenvolvimento
npm run dev
```

O frontend roda em `http://localhost:3000`.

### Variavel de ambiente (opcional)

Se o backend estiver em outra porta ou servidor, crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Por padrao, o proxy do Next.js ja aponta para `http://localhost:8080`.

---

## Passo 5: Testar o Fluxo Completo

### 5.1 - Testar Cadastro

1. Acesse `http://localhost:3000/register`
2. Preencha:
   - Nome: `Tiago Cypriano`
   - Email: `tiago@teste.com`
   - CPF: `000.000.000-00` (opcional, nao e enviado para a API ainda)
   - Telefone: `(34) 99999-0000` (opcional)
   - Senha: `123456`
   - Confirmar Senha: `123456`
3. Clique em "Criar conta"
4. **Esperado:** Mensagem de sucesso e redirecionamento para `/login`

### 5.2 - Verificar no Banco

```bash
sudo -u postgres psql -d finance
```

```sql
SELECT id, nome, email, data_inclusao FROM usuarios;
```

Voce deve ver o usuario criado. A senha esta criptografada com BCrypt.

### 5.3 - Testar Login

1. Acesse `http://localhost:3000/login`
2. Preencha:
   - Email: `tiago@teste.com`
   - Senha: `123456`
3. Clique em "Entrar"
4. **Esperado:** Redirecionamento para o Dashboard (`/`)

### 5.4 - Testar Protecao de Rotas

1. Faca logout clicando em "Sair" na sidebar
2. Tente acessar `http://localhost:3000` diretamente
3. **Esperado:** Redirecionamento automatico para `/login`

### 5.5 - Testar com cURL (opcional)

```bash
# Cadastrar usuario
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste", "email": "teste@teste.com", "senha": "123456"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@teste.com", "senha": "123456"}'

# Verificar usuario logado (usar o token retornado)
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Resumo das Portas

| Servico    | Porta  | URL                           |
|------------|--------|-------------------------------|
| Frontend   | 3000   | http://localhost:3000          |
| Backend    | 8080   | http://localhost:8080          |
| PostgreSQL | 5432   | jdbc:postgresql://localhost:5432/finance |

## Endpoints da API

| Metodo | Endpoint             | Auth?  | Descricao                |
|--------|---------------------|--------|--------------------------|
| POST   | /api/auth/login      | Nao    | Login (retorna JWT)      |
| POST   | /api/users/register  | Nao    | Cadastro de usuario      |
| GET    | /api/users/me        | Sim    | Dados do usuario logado  |
| GET    | /api/users/:id       | Sim    | Buscar usuario por ID    |
| GET    | /api/users           | Sim    | Listar todos os usuarios |

---

## Problemas Comuns

### "Connection refused" no login/cadastro
- Verifique se o backend esta rodando na porta 8080
- Verifique se o PostgreSQL esta rodando na porta 5432

### "Email ja esta em uso"
- O email informado ja foi cadastrado. Use outro email ou limpe o banco:
  ```sql
  DELETE FROM usuarios WHERE email = 'tiago@teste.com';
  ```

### Erro de CORS
- O frontend usa proxy via `next.config.mjs` para evitar CORS
- Se ainda houver problemas, adicione CORS no backend criando um arquivo `CorsConfig.java`:
  ```java
  @Configuration
  public class CorsConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
              .allowedOrigins("http://localhost:3000")
              .allowedMethods("GET", "POST", "PUT", "DELETE")
              .allowedHeaders("*");
      }
  }
  ```

### Senha do PostgreSQL incorreta
- Edite `application.yaml` no backend e altere o campo `password`
