# Sistema de Achados e Perdidos — IFPE

## Sobre o projeto

Sistema web desenvolvido para o IFPE Campus Palmares, com o objetivo de facilitar o registro, a consulta e o gerenciamento de objetos perdidos e encontrados na instituição.

## Tecnologias utilizadas

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker
- Vitest
- Git e GitHub

## Principais funcionalidades

- Cadastro, consulta e atualização de objetos.
- Gerenciamento de categorias e locais.
- Cadastro e gerenciamento de usuários.
- Registro de devoluções.
- Validação de dados e relacionamentos entre registros.

## Banco de dados

O sistema utiliza PostgreSQL para armazenar os dados e TypeORM para mapear as entidades e gerenciar as migrações.

As principais entidades do MVP são:

- Objeto
- Categoria
- Local
- Usuário
- Devolução

A integração de solicitações, comprovantes e históricos ao banco de dados ficará para etapas futuras.

## Como executar o projeto

### Pré-requisitos

- Node.js e npm
- Docker
- PostgreSQL

### Instalação

1. Acesse a pasta do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente do banco de dados no arquivo `.env`.

4. Inicie o PostgreSQL e confirme que as configurações de conexão estão corretas.

5. Execute as migrações pendentes:

   ```bash
   npm run migration:run
   ```

6. Inicie a aplicação:

   ```bash
   npm run start:dev
   ```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## Testes automatizados

Para executar os testes, utilize:

```bash
npm test
```

## Instituição

Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas do Instituto Federal de Pernambuco (IFPE) — Campus Palmares.