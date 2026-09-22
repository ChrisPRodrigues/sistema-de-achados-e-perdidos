# Registro de Testes

## Validação do projeto

Os testes foram realizados na branch `main` após a integração das funcionalidades.

## Testes realizados

- `npm run build` — OK
- `npm test` — 2 testes passaram
- `GET /objetos` — OK
- `POST /objetos` — OK
- `GET /objetos` — listagem após cadastro — OK
- `GET /objetos/1` — OK
- `GET /objetos/999` — retornou `404 - Objeto não encontrado` — OK
- `PATCH /objetos/1` — atualização realizada — OK
- `GET /objetos/1` após atualização — OK
- `PATCH /objetos/1/devolucao` — status alterado para `devolvido` — OK
- `GET /objetos/1` após devolução — status `devolvido` confirmado — OK

## Resultado

Todos os testes realizados apresentaram o resultado esperado.