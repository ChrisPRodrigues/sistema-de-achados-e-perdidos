# Sistema de Achados e Perdidos — IFPE

## Sobre o projeto

Sistema web desenvolvido para o IFPE Campus Palmares, com o objetivo de facilitar o registro, a consulta e o gerenciamento de objetos perdidos e encontrados na instituição.

O projeto utiliza NestJS no backend, com persistência de dados em PostgreSQL por meio do TypeORM.

## Tecnologias utilizadas

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker (opcional)
- Vitest
- Git e GitHub

## Principais funcionalidades

- Cadastro, consulta e atualização de objetos.
- Gerenciamento de categorias e locais.
- Cadastro e gerenciamento de usuários.
- Registro e gerenciamento de devoluções.
- Cadastro e gerenciamento de solicitações.
- Validação de dados utilizando DTOs e `class-validator`.
- Validação de relacionamentos entre registros.
- Persistência de dados utilizando TypeORM.
- Tratamento de erros HTTP para operações inválidas.
- Paginação na listagem de objetos.
- Retorno dos dados relacionados de categoria, local e usuário na consulta de objetos.
- Prevenção de solicitações duplicadas para o mesmo usuário e objeto.

## Banco de dados

O sistema utiliza PostgreSQL para armazenar os dados e TypeORM para mapear as entidades, estabelecer relacionamentos e gerenciar as migrations.

As principais entidades do MVP são:

- Objeto
- Categoria
- Local
- Usuário
- Devolução
- Solicitação

As entidades possuem relacionamentos definidos para garantir a integridade referencial dos registros.

A integração de solicitações ao banco de dados foi implementada por meio da entidade Solicitação, que relaciona usuários e objetos. Comprovantes e históricos permanecem para etapas futuras.

As migrations são utilizadas para controlar as alterações na estrutura do banco de dados, com `synchronize: false`.

Também foi implementada uma migration para converter os identificadores inteiros para UUID, preservando os relacionamentos entre as tabelas.

As chaves estrangeiras utilizam restrições de exclusão (`RESTRICT`), protegendo registros que possuem relacionamentos com outras entidades.

## Validações

O sistema utiliza DTOs com `class-validator` e um `ValidationPipe` global para validar os dados recebidos pelas rotas.

Entre as validações implementadas estão:

- Verificação de campos obrigatórios.
- Validação de formatos e tipos de dados.
- Rejeição de propriedades não permitidas.
- Validação de identificadores numéricos.
- Verificação da existência de registros relacionados.
- Tratamento de situações de conflito e registros inexistentes.
- Prevenção de solicitações duplicadas para o mesmo usuário e objeto, com retorno HTTP 409 em caso de conflito.

## Gerenciamento de devoluções

O módulo de devoluções passou por correções para melhorar a integridade e a consistência dos dados.

As principais melhorias implementadas foram:

- Centralização das regras de devolução no `DevolucaoService`.
- Utilização da mesma lógica de negócio em `POST /devolucoes` e `PATCH /objetos/:id/devolucao`.
- Verificação da existência do objeto e do usuário.
- Restrição do registro de devoluções a usuários do tipo docente.
- Prevenção de devoluções duplicadas.
- Utilização de transações do TypeORM.
- Implementação de bloqueio pessimista para proteger alterações concorrentes.
- Atualização do status do objeto para `devolvido`.
- Inclusão do campo `observacao` nas devoluções.
- Restrição das atualizações de devoluções ao campo `observacao`.
- Restauração do status do objeto para `encontrado` quando uma devolução é excluída.

As correções foram implementadas e verificadas por testes unitários. A execução completa com PostgreSQL ainda precisa ser validada.

## Solicitações

O módulo de solicitações foi integrado ao PostgreSQL por meio do TypeORM.

As principais implementações foram:

- Cadastro e consulta de solicitações.
- Relacionamento entre usuários e objetos.
- Verificação da existência do usuário e do objeto.
- Prevenção de solicitações duplicadas para o mesmo usuário e objeto.
- Restrição de unicidade no banco de dados.
- Tratamento de conflitos com retorno HTTP 409, em vez de erro interno 500.

## Listagem de objetos

A listagem de objetos utiliza paginação e carrega os dados relacionados de categoria, local e usuário.

A consulta retorna os dados do objeto e as informações de seus relacionamentos, evitando consultas individuais para cada registro (problema conhecido como N+1).

## Dados de exemplo (Seed)

Foi criado o arquivo `seed.ts` para inserir dados de exemplo no banco, incluindo usuários, objetos, solicitações e devoluções.

As categorias e os locais utilizados pelo seed são cadastrados previamente pelas migrations.

Para executar o seed:

```bash
npm run seed
```

O seed deve ser executado após as migrations e somente uma vez em um banco vazio, pois utiliza identificadores fixos.

## Como executar o projeto

### Pré-requisitos

- Node.js e npm.
- PostgreSQL acessível, local ou remotamente.
- Docker Desktop (opcional, caso o PostgreSQL seja executado em container).

### Instalação

1. Acesse a pasta do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente de conexão com PostgreSQL no arquivo `.env`, conforme a configuração do projeto.

4. Inicie o PostgreSQL e confirme que o banco está acessível.

5. Execute as migrations pendentes:

   ```bash
   npm run migration:run
   ```

6. Insira os dados de exemplo:

   ```bash
   npm run seed
   ```

7. Inicie a aplicação:

   ```bash
   npm run start:dev
   ```

A aplicação ficará disponível em:

[http://localhost:3000](http://localhost:3000)

**Observação:** a execução das migrations depende de uma conexão válida com PostgreSQL e de um banco vazio compatível com a estrutura atual.

## Testes automatizados

O projeto utiliza Vitest para executar testes automatizados.

Para executar todos os testes:

```bash
npm test
```

Para verificar a compilação:

```bash
npm run build
```

### Resultados obtidos

Na execução de 25/10/2026, realizada durante as correções de consistência das devoluções, foram obtidos os seguintes resultados:

| Arquivo | Testes aprovados |
|---|---:|
| devolucao.service.spec.ts | 5 |
| gerenciamento.service.spec.ts | 5 |
| gerenciamento.controller.spec.ts | 3 |
| objetos.controller.spec.ts | 1 |
| app.controller.spec.ts | 1 |
| **Total** | **15** |

**Resultado:** 15 testes aprovados, nenhuma falha.

A compilação do projeto também foi concluída com sucesso.

Para consultar o histórico de verificações, consulte o arquivo `TESTES.md`.

## Instituição

Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas do Instituto Federal de Pernambuco (IFPE) — Campus Palmares.