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
| **1. Estrutura do backend** | O backend foi desenvolvido em NestJS com TypeScript, organizado em módulos, controllers e services. Além do módulo de objetos, foi criado o módulo de usuários. | `Pasta` `backend/src`, `ObjetosModule`, `UsuariosModule`, controllers e services. |
| **2. Modelo de dados** | Foram criadas as interfaces `Objeto` e `Usuario` para representar os dados principais do sistema. A interface `Objeto` contém informações como id, nome, descrição, categoria, local, data e status. A interface `Usuario` contém informações como id, nome e email. | `src/objetos/models/objeto/objeto.interface.ts` e `src/usuarios/models/usuario/usuario.interface.ts` |
| **3. Persistência dos dados** | Nesta etapa, foi utilizado armazenamento em memória para armazenar e manipular os objetos e usuários enquanto a aplicação está em execução. | `objetos-repository.service.ts` e `src/usuarios/usuarios.service.ts` |
| **4. Cadastro** | Foi implementado o cadastro de novos objetos encontrados e também o cadastro de usuários por meio de rotas HTTP. | `POST /objetos`, `POST /usuarios`, `cadastro.controller.ts`, `cadastro.service.ts`, `usuarios.controller.ts` e `usuarios.service.ts` |
| **5. Listagem/Pesquisa** | Foi implementada a consulta dos objetos cadastrados e a listagem dos usuários cadastrados. | `GET /objetos`, `GET /usuarios` e respectivos controllers e services. |
| **6. Consulta individual** | Foi implementada a busca de um objeto específico e de um usuário específico através do seu identificador. | `GET /objetos/:id` e `GET /usuarios/:id` |
| **7. Gerenciamento** | Foram implementadas operações para atualizar informações dos objetos cadastrados e também para atualizar e excluir usuários. | `PATCH /objetos/:id`, `PATCH /usuarios/:id` e `DELETE /usuarios/:id` |
| **8. Devolução** | Foi implementada uma operação específica para registrar a devolução de um objeto encontrado. | `PATCH /objetos/:id/devolucao`, `gerenciamento.controller.ts` e `gerenciamento.service.ts` |
| **9. Organização do código** | O projeto separa responsabilidades entre controllers, services, modelos e repositories. As funcionalidades de usuários também foram organizadas em um módulo próprio. | Estrutura de `src/objetos/` e `src/usuarios/` |
| **10. Trabalho em equipe** | As funcionalidades foram desenvolvidas em branches separadas e posteriormente integradas à branch `main`. | `feat/cadastro-objetos`, `feat/gerenciamento-devolucao`, `feature/buscar-objeto-por-id`, `feature/get-objetos` e `feature/cadastro-usuarios` |
| **11. Testes/documentação** | O repositório possui arquivos de teste e documentação das funcionalidades implementadas. Também foram realizadas verificações das operações de usuários, incluindo cadastro, consulta, atualização e exclusão. | `objetos.controller.spec.ts`, `TESTES.md`, `readme.md` e verificações das rotas de `usuarios`. |
| **12. Banco de dados / migrations** | Não implementado nesta etapa. Os dados continuam sendo mantidos em memória. | — |
| **13. DTOs e validações** | Ainda não foram implementados DTOs e validações de entrada nesta etapa. | — |
