# E2 — Consultas com TypeORM

## Projeto: Sistema de Achados e Perdidos

**Tecnologias:** NestJS, TypeORM e PostgreSQL.

**Objetivo:** implementar consultas utilizando o Repository do TypeORM, analisar os comandos SQL gerados e demonstrar o problema N+1.

## 1. E06.1 — Consultas com Repository

Foram implementadas oito consultas utilizando a entidade `ObjetoEntity`. Os comandos SQL apresentados foram obtidos dos logs reais do TypeORM.

Para facilitar a leitura, as consultas SQL de 1 a 7 foram simplificadas, mantendo as tabelas, filtros, parâmetros, relacionamentos e ordenações observados nos logs. O TypeORM também selecionou as demais colunas da entidade.

### Consulta 1 — Objetos encontrados antes de uma data

**TypeScript:**

```typescript
async objetosAntesDe(data: Date) {
  return this.objetosRepository.find({
    where: { dataEncontrado: LessThan(data) },
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

**Resultado:** 1 objeto.

### Consulta 2 — Buscar objetos pelo nome

**TypeScript:**

```typescript
async objetosPorNome(nome: string) {
  return this.objetosRepository.find({
    where: { nome: ILike(`%${nome}%`) },
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

**Resultado:** 1 objeto.

O operador `ILIKE` realiza a busca sem diferenciar letras maiúsculas e minúsculas.

### Consulta 3 — Objetos cadastrados por usuário

**TypeScript:**

```typescript
async objetosPorUsuario(usuarioId: number) {
  return this.objetosRepository.find({
    where: {
      usuario: { id: usuarioId },
    },
    relations: {
      usuario: true,
    },
  });
}
```

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
INNER JOIN "usuarios" "Usuario"
  ON "Usuario"."id" = "ObjetoEntity"."usuario_id"
WHERE "Usuario"."id" = $1;
```

**Parâmetro:** `1`

**Resultado:** 1 objeto.

O `INNER JOIN` permite recuperar os dados do usuário associado ao objeto.

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

**Resultado:** 1 objeto.

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

**Resultado:** 0 objetos.

A coluna `descricao` é obrigatória na entidade atual, portanto essa consulta normalmente não encontrará registros.

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

**Resultado:** 1 objeto, pois havia apenas um registro cadastrado.

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

**Resultado:** 1 objeto.

### Consulta 8 — Quantidade total de objetos

**TypeScript:**

```typescript
async contarObjetos() {
  return this.objetosRepository.count();
}
```

**SQL real gerado pelo TypeORM:**

```sql
SELECT COUNT(1) AS "cnt"
FROM "objetos" "ObjetoEntity";
```

**Resultado:** 1 objeto.

O método `count()` permite contar os registros diretamente no banco de dados.

---

## 2. Experimento N+1

O experimento foi realizado com 50 objetos temporários, criados dentro de uma transação no PostgreSQL.

### Implementação sem otimização

Foi realizada uma consulta inicial para recuperar os 50 objetos. Em seguida, o código executou 50 consultas individuais para buscar o usuário associado, totalizando 51 consultas SQL.

```typescript
const objetos = await objetosRepository.find({
  where: { id: In(ids) },
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
  where: { id: In(ids) },
  relations: {
    usuario: true,
  },
  take: 50,
});
```

### Resultados reais

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

Os tempos apresentados correspondem a uma execução do experimento e podem variar conforme a conexão e a carga do banco.

Ao final, foi executado `ROLLBACK`, desfazendo a inserção dos 50 objetos temporários.

---

## 3. Considerações finais

As oito consultas demonstraram o funcionamento dos métodos `find()`, `count()` e dos operadores `LessThan`, `ILike`, `In` e `IsNull`.

O experimento N+1 demonstrou a importância de carregar relacionamentos de maneira eficiente para evitar consultas desnecessárias.

A implementação foi realizada no projeto Sistema de Achados e Perdidos, adaptando os exemplos do roteiro da disciplina para suas entidades existentes.

---

## 4. Experimento CRUD com TypeORM

O experimento CRUD foi realizado utilizando os métodos do Repository do TypeORM, conectado ao PostgreSQL.

As operações foram executadas dentro de uma transação para permitir a demonstração dos comandos SQL sem manter alterações permanentes no banco de dados.

### CREATE — Cadastro de objeto

**Método:** `create()` e `save()`.

**SQL gerado:**

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

**Resultado:** objeto cadastrado com ID 53 e nome `E2 Teste CRUD`.

### READ — Consulta de objeto

**Método:** `findOne()`.

**SQL gerado — versão resumida:**

```sql
SELECT *
FROM "objetos" "ObjetoEntity"
WHERE "ObjetoEntity"."id" = $1
LIMIT 1;
```

**Parâmetro:** `53`.

**Resultado:** objeto encontrado corretamente.

### UPDATE — Atualização de objeto

**Método:** `save()`.

Antes da atualização, o TypeORM executou uma consulta `SELECT` para verificar o registro existente.

**SQL de atualização:**

```sql
UPDATE "objetos"
SET "nome" = $1
WHERE "id" = $2;
```

**Parâmetros:** `E2 Teste CRUD Atualizado`, `53`.

**Resultado:** nome do objeto atualizado com sucesso.

### DELETE — Exclusão de objeto

**Método:** `delete()`.

**SQL gerado:**

```sql
DELETE FROM "objetos"
WHERE "id" = $1;
```

**Parâmetro:** `53`.

**Resultado:** um registro excluído.

Após a exclusão, foi executada outra consulta `SELECT` para confirmar que o objeto não estava mais disponível.

### ROLLBACK — Desfazimento da transação

**SQL executado:**

```sql
ROLLBACK;
```

O comando desfez as alterações realizadas durante o experimento, evitando que os dados temporários permanecessem no banco compartilhado.

### Conclusão do experimento CRUD

O experimento demonstrou o funcionamento das quatro operações básicas de persistência utilizando o Repository do TypeORM.

Os métodos `save()`, `findOne()` e `delete()` permitiram cadastrar, consultar, atualizar e excluir registros por meio de comandos SQL gerados automaticamente.

A utilização de uma transação com `ROLLBACK` permitiu realizar os testes sem alterar permanentemente os registros do projeto.
