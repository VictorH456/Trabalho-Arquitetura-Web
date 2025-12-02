# Trabalho 4 - Defesas Arquiteturais

## 🛡️ Vulnerabilidades Mitigadas

### 1. SQL Injection (SQLi)
**Defesa:** Uso do ODM **Mongoose**.
**Explicação:** O Mongoose utiliza Queries Parametrizadas por padrão, tratando inputs (como `req.body.email`) estritamente como dados, impedindo que comandos SQL injetados alterem a lógica da consulta.

### 2. Cross-Site Scripting (XSS)
**Defesa:** Template Engine **EJS** com Output Escaping.
**Explicação:** O EJS escapa automaticamente qualquer variável renderizada com a sintaxe `<%= variavel %>`, convertendo caracteres perigosos (como `<script>`) em entidades HTML seguras.

### 3. Cross-Site Request Forgery (CSRF)
**Defesa:** Middleware **csurf** (Tokens Anti-CSRF).
**Explicação:** Implementamos tokens sincronizadores. O servidor gera um token secreto na sessão e o exige em cada requisição POST (via campo oculto `_csrf`). Requisições sem esse token são rejeitadas.

### 4. Força Bruta (Brute Force)
**Defesa:** Middleware **express-rate-limit**.
**Explicação:** Configuramos um limitador na rota `/login` que bloqueia IPs que excedam 5 tentativas falhas em 1 minuto.

### 5. Exposição de Credenciais
**Defesa:** Biblioteca **dotenv**.
**Explicação:** As strings de conexão do banco e segredos de sessão foram movidos para um arquivo `.env` e não estão mais "hardcoded" no código-fonte.