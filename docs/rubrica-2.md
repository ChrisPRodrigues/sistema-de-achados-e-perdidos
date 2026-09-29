## Estrutura do backend

**O que foi realizado no projeto:**  
O backend foi desenvolvido em **NestJS com TypeScript**, organizado em módulos, controllers e services.

**Evidência:**  
Pasta `backend/src`, `ObjetosModule`, controllers e services.

---

## Modelo de dados

**O que foi realizado no projeto:**  
Foi criada a interface `Objeto` para representar os objetos encontrados, contendo informações como id, nome, descrição, categoria, local, data e status.

**Evidência:**  
`src/objetos/models/objeto/objeto.interface.ts`

---

## Persistência dos dados

**O que foi realizado no projeto:**  
Nesta etapa foi utilizado um serviço de repositório em memória para armazenar e manipular os objetos enquanto a aplicação está em execução.

**Evidência:**  
`objetos-repository.service.ts`

---

## Cadastro

**O que foi realizado no projeto:**  
Foi implementado o cadastro de novos objetos encontrados por meio de uma rota HTTP.

**Evidência:**  
`POST /objetos`, `cadastro.controller.ts` e `cadastro.service.ts`

---

## Listagem/Pesquisa

**O que foi realizado no projeto:**  
Foi implementada a consulta dos objetos cadastrados.

**Evidência:**  
`GET /objetos` e `objetos.controller.ts`

---

## Consulta individual

**O que foi realizado no projeto:**  
Foi implementada a busca de um objeto específico através do seu identificador.

**Evidência:**  
`GET /objetos/:id`

---

## Gerenciamento

**O que foi realizado no projeto:**  
Foram implementadas operações para atualizar informações dos objetos cadastrados.

**Evidência:**  
`PATCH /objetos/:id`

---

## Devolução

**O que foi realizado no projeto:**  
Foi implementada uma operação específica para registrar a devolução de um objeto encontrado.

**Evidência:**  
`PATCH /objetos/:id/devolucao`, `gerenciamento.controller.ts` e `gerenciamento.service.ts`

---

## Organização do código

**O que foi realizado no projeto:**  
O projeto separa responsabilidades entre controller, service, modelo e repository.

**Evidência:**  
Estrutura de `src/objetos/`

---

## Trabalho em equipe

**O que foi realizado no projeto:**  
As funcionalidades foram desenvolvidas em branches separadas e posteriormente integradas à branch `main`.

**Evidência:**  
`feat/cadastro-objetos`, `feat/gerenciamento-devolucao`, `feature/buscar-objeto-por-id` e `feature/get-objetos`

---

## Testes/documentação

**O que foi realizado no projeto:**  
O repositório possui arquivos de teste e documentação das funcionalidades implementadas.

**Evidência:**  
`objetos.controller.spec.ts`, `TESTES.md` e `readme.md`

---

## Banco de dados / migrations

**O que foi realizado no projeto:**  
**Não implementado nesta etapa.** Os dados são mantidos em memória.

**Evidência:**  
—

---

## DTOs e validações

**O que foi realizado no projeto:**  
**Não implementado nesta etapa.**

**Evidência:**  
—