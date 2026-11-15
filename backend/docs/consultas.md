
# E2 — Consultas com TypeORM

## Projeto: Sistema de Achados e Perdidos

**Tecnologias:** NestJS, TypeORM e PostgreSQL.

**Objetivo:** implementar consultas utilizando o Repository do TypeORM, analisar os comandos SQL gerados e demonstrar o problema N+1.

## 1. E06.1 — Consultas com Repository

Foram implementadas oito consultas utilizando a entidade `ObjetoEntity`.

Os comandos SQL apresentados abaixo são versões resumidas dos logs obtidos durante os experimentos anteriores à migração dos identificadores para UUID.

As consultas SQL de 1 a 7 foram simplificadas para facilitar a leitura, mantendo as tabelas, os filtros, os parâmetros e as ordenações. O TypeORM também selecionou as demais colunas das entidades.

### Consulta 1 — Objetos encontrados antes de uma data

**TypeScript:**

```typescript
async objetosAntesDe(data: Date) {
  return this.objetosRepository.find({
    where: {
      dataEncontrado: LessThan(data),
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."dataEncontrado" < $1;
```

**Parâmetro:** `2026-11-01T00:00:00.000Z`

**Resultado registrado:** 1 objeto.

### Consulta 2 — Buscar objetos pelo nome

**TypeScript:**

```typescript
async objetosPorNome(nome: string) {
  return this.objetosRepository.find({
    where: {
      nome: ILike(`%${nome}%`),
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."nome" ILIKE $1;
```

**Parâmetro:** `%bola%`

**Resultado registrado:** 1 objeto.

O operador `ILIKE` realiza buscas sem diferenciar letras maiúsculas e minúsculas.

### Consulta 3 — Objetos cadastrados por usuário

**TypeScript atualizado para UUID:**

```typescript
async objetosPorUsuario(usuarioId: string) {
  return this.objetosRepository.find({
    where: {
      usuario: {
        id: usuarioId,
      },
    },
    relations: {
      usuario: true,
    },
  });
}
```

**SQL gerado anteriormente — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
INNER JOIN "usuarios" "Usuario"
  ON "Usuario"."id" = "ObjetoEntity"."usuario_id"
WHERE "Usuario"."id" = $1;
```

**Parâmetro da execução anterior:** `1`

**Resultado anterior:** 1 objeto.

**Observação:** após a migração do projeto para UUID, o método passou a receber `usuarioId` como `string`. O parâmetro numérico apresentado pertence à execução anterior à migração e não representa um resultado obtido com a estrutura atual.

O relacionamento com a entidade `UsuarioEntity` permite recuperar os dados do usuário associado ao objeto.

### Consulta 4 — Objetos por status

**TypeScript:**

```typescript
async objetosPorStatus() {
  return this.objetosRepository.find({
    where: {
      status: In(['encontrado', 'devolvido']),
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."status" IN ($1, $2);
```

**Parâmetros:** `encontrado`, `devolvido`

**Resultado registrado:** 1 objeto.

### Consulta 5 — Objetos sem descrição

**TypeScript:**

```typescript
async objetosSemDescricao() {
  return this.objetosRepository.find({
    where: {
      descricao: IsNull(),
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."descricao" IS NULL;
```

**Resultado registrado:** 0 objetos.

Como o campo `descricao` é obrigatório na entidade atual, normalmente essa consulta não encontrará registros.

### Consulta 6 — Dez objetos mais recentes

**TypeScript:**

```typescript
async objetosRecentes() {
  return this.objetosRepository.find({
    order: {
      dataEncontrado: 'DESC',
    },
    take: 10,
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
ORDER BY "ObjetoEntity"."dataEncontrado" DESC
LIMIT 10;
```

**Resultado registrado:** 1 objeto.

### Consulta 7 — Objetos cujo nome começa com determinado texto

**TypeScript:**

```typescript
async objetosQueComecamCom(texto: string) {
  return this.objetosRepository.find({
    where: {
      nome: ILike(`${texto}%`),
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."nome" ILIKE $1;
```

**Parâmetro:** `Bo%`

**Resultado registrado:** 1 objeto.

### Consulta 8 — Quantidade total de objetos

**TypeScript:**

```typescript
async contarObjetos() {
  return this.objetosRepository.count();
}
```

**SQL registrado:**

```sql
SELECT COUNT(1) AS "cnt"
FROM "objetos" "ObjetoEntity";
```

**Resultado registrado:** 1 objeto.

O método `count()` permite contar os registros diretamente no banco de dados.

---

## 2. Listagem paginada

A aplicação utiliza o método `findAndCount()` do Repository do TypeORM para realizar a listagem paginada de objetos.

A paginação utiliza os parâmetros `page` e `limit`, com valores padrão de 1 e 10, respectivamente.

O DTO de paginação utiliza as validações `@IsInt()`, `@Min(1)` e `@Max(100)`, impedindo que o limite solicitado ultrapasse 100 registros por página.

**Exemplo de implementação:**

```typescript
const [objetos, total] =
  await this.objetosRepository.findAndCount({
    relations: {
      categoria: true,
      localEncontrado: true,
      usuario: true,
    },
    relationLoadStrategy: 'join',
    skip: (page - 1) * limit,
    take: limit,
    order: {
      id: 'ASC',
    },
  });
```

A consulta recupera os registros da página solicitada e a quantidade total de objetos, permitindo calcular o número de páginas.

---

## 3. Experimento N+1

O experimento foi realizado com 50 objetos temporários, criados dentro de uma transação no PostgreSQL.

### Implementação sem otimização

Foi realizada uma consulta inicial para recuperar os 50 objetos. Em seguida, o código executou 50 consultas individuais para buscar o usuário associado, totalizando 51 consultas SQL.

```typescript
const objetos = await objetosRepository.find({
  where: {
    id: In(ids),
  },
  take: 50,
});

for (const objeto of objetos) {
  await usuariosRepository.findOneBy({
    id: usuario.id,
  });
}
```

Como todos os objetos temporários pertenciam ao mesmo usuário, o experimento simulou intencionalmente consultas repetidas.

### Implementação otimizada

Foi utilizado `relations` para carregar os usuários associados aos objetos:

```typescript
const objetosOtimizados = await objetosRepository.find({
  where: {
    id: In(ids),
  },
  relations: {
    usuario: true,
  },
  take: 50,
});
```

### Resultados medidos

Os resultados abaixo foram obtidos na execução anterior à integração das alterações de UUID.

| Abordagem | Consultas SQL | Tempo |
|---|---:|---:|
| Sem otimização (N+1) | 51 | 2723,44 ms |
| Com `relations` | 2 | 111,38 ms |

**Redução de consultas:** 49 consultas, aproximadamente 96,1%.

**Melhoria no tempo:** execução aproximadamente 24,5 vezes mais rápida nessa medição.

### Conclusão

O problema N+1 ocorre quando uma aplicação realiza uma consulta para recuperar vários registros e depois executa consultas adicionais para buscar individualmente seus relacionamentos.

Esse problema pode passar despercebido durante o desenvolvimento porque, com poucos registros, a aplicação aparenta funcionar normalmente. Entretanto, conforme a quantidade de registros aumenta, o número de consultas cresce e o desempenho pode ser prejudicado.

O experimento demonstrou que utilizar `relations` reduziu significativamente a quantidade de consultas SQL e o tempo de execução.

Os tempos apresentados correspondem a uma execução específica e podem variar conforme a conexão e a carga do banco de dados.

Ao final do experimento, foi executado `ROLLBACK`, desfazendo a inserção dos 50 objetos temporários.

---

## 4. Experimento CRUD com TypeORM

O experimento CRUD foi realizado utilizando métodos do Repository do TypeORM, conectado ao PostgreSQL.

As operações foram executadas dentro de uma transação para demonstrar os comandos SQL sem manter alterações permanentes no banco de dados.

Os resultados desta seção foram registrados antes da migração dos identificadores para UUID.

### CREATE — Cadastro de objeto

**Métodos:** `create()` e `save()`.

**SQL registrado:**

```sql
INSERT INTO "objetos"(
  "nome",
  "descricao",
  "dataEncontrado",
  "status",
  "categoria_id",
  "local_id",
  "usuario_id"
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING "id", "status";
```

**Resultado anterior:** objeto cadastrado com ID `53` e nome `E2 Teste CRUD`.

### READ — Consulta de objeto

**Método:** `findOne()`.

**SQL registrado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."id" = $1
LIMIT 1;
```

**Parâmetro anterior:** `53`.

**Resultado:** objeto encontrado corretamente.

### UPDATE — Atualização de objeto

**Método:** `save()`.

Antes da atualização, o TypeORM executou uma consulta `SELECT` para verificar o registro existente.

**SQL registrado:**

```sql
UPDATE "objetos"
SET "nome" = $1
WHERE "id" = $2;
```

**Parâmetros anteriores:** `E2 Teste CRUD Atualizado`, `53`.

**Resultado:** nome do objeto atualizado com sucesso.

### DELETE — Exclusão de objeto

**Método:** `delete()`.

**SQL registrado:**

```sql
DELETE FROM "objetos"
WHERE "id" = $1;
```

**Parâmetro anterior:** `53`.

**Resultado:** um registro excluído.

Após a exclusão, foi executada outra consulta `SELECT` para confirmar que o objeto não estava mais disponível.

### ROLLBACK — Desfazimento da transação

**SQL registrado:**

```sql
ROLLBACK;
```

O comando desfez as alterações realizadas durante o experimento, evitando que os dados temporários permanecessem no banco compartilhado.

### Conclusão do experimento CRUD

O experimento demonstrou o funcionamento das quatro operações básicas de persistência utilizando o Repository do TypeORM.

Os métodos `save()`, `findOne()` e `delete()` permitiram cadastrar, consultar, atualizar e excluir registros por meio de comandos SQL gerados automaticamente.

A utilização de uma transação com `ROLLBACK` permitiu realizar os testes sem alterar permanentemente os registros do projeto.

---

## 5. Segurança das consultas

As consultas implementadas utilizam os métodos do Repository do TypeORM, incluindo `find()`, `findAndCount()` e `count()`.

Os filtros utilizam operadores como `LessThan`, `ILike`, `In` e `IsNull`.

Os valores recebidos são fornecidos ao TypeORM como parâmetros, sem concatenar diretamente entradas do usuário na estrutura SQL.

Por exemplo:

```typescript
where: {
  nome: ILike(`%${nome}%`),
}
```

Nesse caso, a interpolação monta o valor do filtro de pesquisa, enquanto o TypeORM utiliza parâmetros SQL para executar a consulta.

---

## 6. Considerações finais

A atividade E2 demonstrou o funcionamento das consultas e operações CRUD utilizando o Repository do TypeORM.

Foram implementadas oito consultas, paginação com `findAndCount()`, controle do limite de registros e um experimento para demonstrar o problema N+1.

A implementação foi integrada às alterações da equipe, incluindo a utilização de identificadores UUID.

A compilação do projeto foi concluída com sucesso e os 37 testes automatizados foram aprovados.

Os resultados experimentais documentados correspondem às execuções anteriores à migração para UUID, sendo preservados como evidência das medições realizadas.
