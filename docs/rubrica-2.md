                                      **Rubrica2**  
                            **Etapa 2: Sistema preliminar**

**Equipe:** Darkiane Naiara,Chris(Iara Cristina),José Adilson,Perla Bezerra.  
**Data:** 29.09.2026

| Verificação | Sim | Não |
| :---- | ----- | :---- |
| Repositório acessível, com o código do backend | Sim |  |
| Modelo de dados versionado (migrações aplicadas, sem erro) | Sim |  |
| Ao menos um endpoint de API funcionando fim a fim (banco → resposta) | sim  |  |

**Critérios**

| Critério | O que foi realizado no projeto | Evidência |
| ----- | ----- | ----- |
| **1\. Estrutura do backend** | O backend foi desenvolvido em NestJS com TypeScript, organizado em módulos, controllers e services. | Pasta `backend/src`, `ObjetosModule`, controllers e services. |
| **2\. Modelo de dados** | Foi criada a interface Objeto para representar os objetos encontrados, contendo informações como id, nome, descrição, categoria, local, data  e status. | `src/objetos/models/objeto/objeto.interface.ts` |
| **3.Persistência dos dados** | Nesta etapa foi utilizado um serviço de repositório em memória para armazenar e manipular os objetos enquanto a aplicação está em execução. | `objetos-repository.service.ts`|
| **4.Cadastro** | Foi implementado o cadastro de novos objetos encontrados por meio de uma rota HTTP.  | `POST /objetos`, `cadastro.controller.ts` e `cadastro.service.ts` |
| **5\. Listagem/ Pesquisa** | Foi implementada a consulta dos objetos cadastrados. | `GET /objetos` e `objetos.controller.ts`|
| **6\.  Consulta individual** | Foi implementada a busca de um objeto específico através do  seu identificador. | `GET /objetos/:id`|
| **7\. Gerenciamento** | Foram implementadas operações para atualizar informações dos objetos cadastrados. | `PATCH /objetos/:id` |
| **8.Devolução** | Foi implementada uma operação específica para registrar a devolução de um objeto encontrado. | `PATCH /objetos/:id/devolucao`, `gerenciamento.controller.ts` e `gerenciamento.service.ts` |
| **9\. Organização do código** | O projeto separa responsabilidades entre controller, service, modelo e repository. | Estrutura de `src/objetos/`|
| **10\. Trabalho em equipe** | As funcionalidades foram desenvolvidas em branches separadas e posteriormente integradas à branch main. | `feat/cadastro-objetos`, `feat/gerenciamento-devolucao`, `feature/buscar-objeto-por-id` e `feature/get-objetos` |
| **11.Testes/ documentação** | O repositório possui arquivos de teste e documentação das funcionalidades implementadas. | `objetos.controller.spec.ts`, `TESTES.md` e `readme.md`|
| **12.Banco de dados / migrations** | Não implementado nesta etapa. Os dados são mantidos em memória. | \_ |
| **13.DTOs e validações** | Não implementado nesta etapa.  | \_ |
