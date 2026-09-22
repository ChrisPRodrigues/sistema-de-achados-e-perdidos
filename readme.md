# Sistema de Achados e Perdidos — IFPE

Sistema web desenvolvido em NestJS para cadastrar, consultar e gerenciar objetos encontrados no IFPE.

## Objetivo

Facilitar o registro e a devolução de objetos encontrados no campus.

## Tecnologias

- NestJS
- TypeScript
- Node.js
- Vitest
- Git e GitHub

## Funcionalidades

- Cadastrar objetos
- Listar objetos
- Buscar objeto por ID
- Atualizar objeto
- Registrar devolução
- Alterar status entre `encontrado` e `devolvido`

## Como executar

```bash
cd backend
npm install
npm run start:dev
```

### Servidor

http://localhost:3000

## Exemplos de uso

### Cadastrar objeto

```http
POST /objetos
```

```json
{
  "nome": "Mochila",
  "descricao": "Mochila preta encontrada no corredor",
  "categoria": "Material escolar",
  "localEncontrado": "Corredor",
  "dataEncontrado": "2026-09-22",
  "status": "encontrado"
}
```

### Listar objetos

```http
GET /objetos
```

### Buscar por ID

```http
GET /objetos/1
```

### Atualizar objeto

```http
PATCH /objetos/1
```

### Registrar devolução

```http
PATCH /objetos/1/devolucao
```

## Testes

Para executar os testes automatizados:

```bash
npm test
```

Os principais endpoints também foram testados manualmente durante o desenvolvimento.