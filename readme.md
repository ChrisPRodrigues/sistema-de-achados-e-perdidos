# Sistema de Achados e Perdidos — IFPE

Sistema web desenvolvido em **NestJS** para cadastrar, consultar e gerenciar objetos encontrados no IFPE.

## Objetivo

Facilitar o registro e a devolução de objetos encontrados no campus.

## Tecnologias

- **NestJS**
- **TypeScript**
- **Node.js**
- **Vitest**
- **Git e GitHub**

## Funcionalidades

- Cadastrar objetos
- Listar objetos
- Buscar objeto por ID
- Atualizar objeto
- Registrar devolução
- Alterar status entre `encontrado` e `devolvido`

## Como Executar

1. Instale as dependências e inicie o servidor:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. O servidor estará disponível em: [http://localhost:3000](http://localhost:3000)

## Exemplos de Uso

### Cadastrar objeto
`POST /objetos`

**Request Body:**
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
`GET /objetos`

### Buscar por ID
`GET /objetos/1`

### Atualizar objeto
`PATCH /objetos/1`

### Registrar devolução
`PATCH /objetos/1/devolucao`

## Testes

Para executar os testes automatizados, utilize o comando:
```bash
npm test
```

> **Nota:** Os principais endpoints também foram testados manualmente durante o desenvolvimento.
