**Rubrica2**  
**Etapa 2: Sistema preliminar**

**Equipe:** Darkiane Naiara,Chris(Iara Cristina),José Adilson,Pérla Bezerra.  
**Data:** 29.09.2026

| **Verificação**                                                      | **Sim** | **Não** |
| -------------------------------------------------------------------- | ------- | ------- |
| Repositório acessível, com o código do backend                       | Sim     |         |
| Modelo de dados versionado (migrações aplicadas, sem erro)           | Sim     |         |
| Ao menos um endpoint de API funcionando fim a fim (banco → resposta) | sim     |         |

**Critérios**

| **Critério** | **O que foi realizado no projeto** | **Evidência** |
|---|---|---|
| **1. Estrutura do backend** | O backend foi desenvolvido em NestJS com TypeScript, organizado em módulos, controllers e services. Além do módulo de objetos, foi criado o módulo de usuários. Também foi criado um módulo próprio para devoluções. | `Pasta` `backend/src`, `ObjetosModule`, `UsuariosModule`, controllers e services. `DevolucoesModule`. |
| **2. Modelo de dados** | Foram criadas as interfaces `Objeto` e `Usuario` para representar os dados principais do sistema. A interface `Objeto` contém informações como id, nome, descrição, categoria, local, data e status. A interface `Usuario` contém informações como id, nome e email. Também foi criada a interface `Devolucao`, contendo id, objetoId, usuarioId, dataDevolucao e observação. | `src/objetos/models/objeto/objeto.interface.ts`, `src/usuarios/models/usuario/usuario.interface.ts` e `src/devolucoes/devolucao.interface.ts` |
| **3. Persistência dos dados** | Nesta etapa, foi utilizado armazenamento em memória para armazenar e manipular os objetos e usuários enquanto a aplicação está em execução. As devoluções também são armazenadas em memória através de um repository próprio. | `objetos-repository.service.ts`, `src/usuarios/usuarios.service.ts` e `src/devolucoes/devolucao.repository.ts` |
| **4. Cadastro** | Foi implementado o cadastro de novos objetos encontrados e também o cadastro de usuários por meio de rotas HTTP. Também foi implementado o cadastro de devoluções. | `POST /objetos`, `POST /usuarios`, `POST /devolucoes`, `cadastro.controller.ts`, `cadastro.service.ts`, `usuarios.controller.ts` e `usuarios.service.ts` |
| **5. Listagem/Pesquisa** | Foi implementada a consulta dos objetos cadastrados e a listagem dos usuários cadastrados. Também foi implementada a listagem das devoluções. | `GET /objetos`, `GET /usuarios`, `GET /devolucoes` e respectivos controllers e services. |
| **6. Consulta individual** | Foi implementada a busca de um objeto específico e de um usuário específico através do seu identificador. Também foi implementada a busca de uma devolução pelo seu identificador. | `GET /objetos/:id`, `GET /usuarios/:id` e `GET /devolucoes/:id` |
| **7. Gerenciamento** | Foram implementadas operações para atualizar informações dos objetos cadastrados e também para atualizar e excluir usuários. Também foram implementadas operações para atualizar e excluir devoluções. | `PATCH /objetos/:id`, `PATCH /usuarios/:id`, `DELETE /usuarios/:id`, `PATCH /devolucoes/:id` e `DELETE /devolucoes/:id` |
| **8. Devolução** | Foi implementada uma operação específica para registrar a devolução de um objeto encontrado. Também foi criada a entidade `Devolucao`, com cinco métodos de gerenciamento: listar, buscar por ID, adicionar, atualizar e remover. | `PATCH /objetos/:id/devolucao`, `gerenciamento.controller.ts`, `gerenciamento.service.ts`, `devolucao.controller.ts`, `devolucao.service.ts` e `devolucao.repository.ts` |
| **9. Organização do código** | O projeto separa responsabilidades entre controllers, services, modelos e repositories. As funcionalidades de usuários também foram organizadas em um módulo próprio. As funcionalidades de devolução também foram organizadas em um módulo próprio e separado. | Estrutura de `src/objetos/`, `src/usuarios/` e `src/devolucoes/` |
| **10. Trabalho em equipe** | As funcionalidades foram desenvolvidas em branches separadas e posteriormente integradas à branch `main`. | `feat/cadastro-objetos`, `feat/gerenciamento-devolucao`, `feature/buscar-objeto-por-id`, `feature/get-objetos` e `feature/cadastro-usuarios` |
| **11. Testes/documentação** | O repositório possui arquivos de teste e documentação das funcionalidades implementadas. Também foram realizadas verificações das operações de usuários, incluindo cadastro, consulta, atualização e exclusão. Também foram verificadas as operações de cadastro, listagem, consulta, atualização e exclusão de devoluções. | `objetos.controller.spec.ts`, `TESTES.md`, `readme.md`, verificações das rotas de `usuarios` e verificações das rotas de `devolucoes`. |
| **12. Banco de dados / migrations** | Não implementado nesta etapa. Os dados continuam sendo mantidos em memória. | — |
| **13. DTOs e validações** | Ainda não foram implementados DTOs e validações de entrada nesta etapa. | — |
