# Backlog Priorizado — MoSCoW

**Projeto:** Sistema de Achados e Perdidos — IFPE Campus Palmares
**Objetivo:** Organizar e priorizar os requisitos do sistema para orientar o desenvolvimento e as próximas entregas.

## 1. Método MoSCoW

O método MoSCoW é utilizado para classificar os requisitos conforme sua importância para o projeto.

- **Must Have (Obrigatório):** funcionalidades essenciais para o funcionamento do sistema.
- **Should Have (Importante):** funcionalidades relevantes, mas que não impedem o funcionamento básico caso sejam adiadas.
- **Could Have (Desejável):** melhorias que agregam valor, mas possuem prioridade menor.
- **Won't Have (Fora do escopo atual):** funcionalidades que não serão desenvolvidas nesta entrega.

## 2. Backlog priorizado

### Must Have — Obrigatório

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RF01 | Cadastrar, consultar e atualizar objetos encontrados. | Permitir operações por meio da API, com validação dos dados. |
| RF02 | Gerenciar usuários do sistema. | Permitir cadastro, consulta, atualização e exclusão conforme as regras de integridade. |
| RF03 | Gerenciar categorias e locais. | Permitir organizar os objetos por categoria e local. |
| RF04 | Registrar e gerenciar devoluções. | Registrar a devolução, validar os envolvidos e atualizar o status do objeto. |
| RF05 | Registrar e consultar solicitações de objetos. | Permitir criar, consultar, atualizar e excluir solicitações persistidas no PostgreSQL. |
| RF06 | Impedir solicitações duplicadas do mesmo usuário para o mesmo objeto. | Retornar HTTP 409 quando a combinação de usuário e objeto já existir, inclusive em atualizações. |
| RF07 | Garantir persistência e integridade dos dados. | Utilizar PostgreSQL, TypeORM, relacionamentos e migrations. |
| RF08 | Validar entradas e tratar erros da API. | Rejeitar dados inválidos e retornar respostas HTTP adequadas. |

### Should Have — Importante

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RF09 | Gerenciar aprovação e recusa de solicitações. | Permitir controlar os estados pendente, aprovada e recusada com regras de negócio definidas. |
| RF10 | Gerar comprovantes de devolução. | Produzir um comprovante contendo os dados essenciais da devolução. |
| RF11 | Consultar histórico de movimentações. | Permitir acompanhar solicitações e devoluções relacionadas aos objetos. |
| RF12 | Ampliar os testes automatizados. | Cobrir regras de negócio, conflitos e operações críticas. |

### Could Have — Desejável

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RF13 | Implementar busca e filtros avançados. | Filtrar objetos por nome, categoria, local e status. |
| RF14 | Enviar notificações sobre solicitações. | Informar usuários sobre alterações no andamento das solicitações. |
| RF15 | Disponibilizar painel com indicadores. | Exibir quantidades de objetos encontrados, devolvidos e solicitações. |
| RF16 | Permitir anexar imagens aos objetos. | Associar imagens aos registros de objetos. |

### Won't Have — Fora do escopo da entrega atual

| ID | Requisito | Justificativa |
|---|---|---|
| RF17 | Identificar objetos automaticamente por inteligência artificial. | Exige recursos e desenvolvimento adicionais. |
| RF18 | Integrar o sistema a plataformas externas de achados e perdidos. | Não é necessário para o funcionamento inicial. |
| RF19 | Desenvolver aplicativo móvel nativo. | O foco atual é o sistema web. |

## 3. Critérios de priorização

A classificação considera:

- **Valor para o usuário:** importância da funcionalidade para estudantes e servidores.
- **Dependências técnicas:** necessidade de outras funcionalidades para sua implementação.
- **Integridade e segurança:** prevenção de inconsistências e operações inválidas.
- **Viabilidade:** tempo e recursos disponíveis para o desenvolvimento acadêmico.

## 4. Acompanhamento

Este backlog representa uma proposta de priorização dos requisitos do projeto. A classificação poderá ser revisada pela equipe conforme o planejamento das entregas.

A implementação de um requisito não altera automaticamente sua prioridade: o MoSCoW indica sua importância, enquanto o andamento das tarefas deve ser acompanhado separadamente.

## 5. Referências do projeto

- `README.md` — descrição geral, tecnologias e funcionalidades.
- `TESTES.md` — histórico de verificações e testes automatizados.
- `backend/src/` — implementação dos módulos e regras de negócio.
- `backend/src/migrations/` — histórico das alterações do banco de dados.
