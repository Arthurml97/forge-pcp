# 🏭 Forge PCP - Sistema de Planejamento e Controle de Produção

Sistema ERP focado em gestão industrial, desenvolvido para simular o controle de chão de fábrica, engenharia de produto e rastreabilidade de estoque.

![Status](https://img.shields.io/badge/Status-MVP%20Concluído-green)

## O Problema Resolvido
Indústrias precisam garantir que a produção só ocorra se houver insumos suficientes e que cada produto fabricado tenha seu custo e histórico rastreados. O Forge PCP resolve isso com:
- **Engenharia:** Cadastro de Fichas Técnicas (Receitas).
- **Produção:** Baixa automática de insumos ao produzir (Backflushing).
- **Auditoria:** Rastreabilidade completa de quem produziu e quando.
- **Segurança:** Controle de acesso RBAC.

## Tecnologias (Stack)
- **Backend:** Java 17+, Spring Boot 3, JPA/Hibernate, Spring Security(JWT).
- **Frontend:** React.js (Vite), Axios, Toastify.
- **Banco de Dados:** PostgreSQL (Dockerizado).
- **Arquitetura:** REST API, Camadas (MVC), DTOs, Solid Principles.

## Funcionalidades Principais
1.  **Controle de Estoque Inteligente:** Impede produção se faltar matéria-prima.
2.  **Ficha Técnica:** Define que "Mesa" = "4 Pés" + "1 Tampo".
3.  **Histórico de Produção:** Log imutável de todas as operações fabris.
4.  **Gestão Visual:** Painéis de controle para operadores.

## Como Rodar

### Pré-requisitos
- Docker (para o Banco de Dados)
- Java 17 ou superior
- Node.js

### 1. Subir o Banco de Dados
```bash
docker run --name forge-db -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=forge_pcp -p 5433:5432 -d postgres
```

### 2. Rodar o Backend
```bash
./mvnw spring-boot:run
```

### 3. Rodar o Frontend
```bash
cd forge-frontend
npm install
npm run dev
```

### 4. Acesso e Primeiros Passos
O sistema possui controle de acesso (RBAC). Como o banco de dados inicia vazio, siga os passos abaixo para configurar o primeiro acesso:

1. Criar Usuário Administrador (Via Swagger)
Acesse http://localhost:8080/swagger-ui.html e utilize o endpoint POST /auth/register com este JSON:
```Json
{
  "login": "admin",
  "password": "123",
  "role": "ADMIN"
}
```
2. Acessar o Sistema
Vá para http://localhost:5173 e faça login:

Usuário: admin

Senha: 123

Dica: Logado como ADMIN, você poderá cadastrar novos produtos e definir fichas técnicas. Para simular a visão do operador, crie outro usuário com role USER.

## Autor
Desenvolvido por Arthur Liscano como parte do portfólio de Desenvolvimento Backend Java.