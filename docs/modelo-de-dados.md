# Modelo de Dados — Sistema de Achados e Perdidos

## 1. Diagrama ER

O modelo possui seis entidades: Usuário, Objeto, Categoria, Local, Solicitação e Devolução.

```mermaid
erDiagram
    CATEGORIAS ||--o{ OBJETOS : classifica
    LOCAIS ||--o{ OBJETOS : localiza
    USUARIOS ||--o{ OBJETOS : registra
    USUARIOS ||--o{ SOLICITACOES : realiza
    OBJETOS ||--o{ SOLICITACOES : recebe
    OBJETOS ||--o| DEVOLUCOES : possui
    USUARIOS ||--o{ DEVOLUCOES : registra

    CATEGORIAS {
        uuid id PK
        varchar nome UK
        text descricao
    }

    LOCAIS {
        uuid id PK
        varchar nome UK
        text descricao
    }

    USUARIOS {
        uuid id PK
        varchar nome
        varchar email UK
        enum tipo
    }

    OBJETOS {
        uuid id PK
        varchar nome
        text descricao
        uuid categoria_id FK
        uuid local_id FK
        uuid usuario_id FK
        timestamptz dataEncontrado
        enum status
    }

    SOLICITACOES {
        uuid id PK
        uuid usuario_id FK
        uuid objeto_id FK
        enum status
    }

    DEVOLUCOES {
        uuid id PK
        uuid objeto_id FK
        uuid usuario_id FK
        varchar observacao
        timestamptz dataDevolucao
    }
```

A relação N-N entre Usuário e Objeto é representada pela entidade associativa Solicitação. Ela possui o atributo `status`, por isso foi modelada com duas relações 1-N (`@ManyToOne` e `@OneToMany`), em vez de um `@ManyToMany` direto.

## 2. Antes × Depois

| Antes | Depois | Justificativa |
|---|---|---|
| Identificadores numéricos na aplicação. | Identificadores UUID. | Evitar exposição de identificadores sequenciais nas URLs. |
| Referências entre registros sem relacionamentos explícitos em todas as entidades. | Relacionamentos com `@ManyToOne`, `@OneToMany` e `@OneToOne`. | Representar as relações do domínio. |
| Associação entre usuário e objeto sem representar adequadamente os dados da solicitação. | Entidade associativa Solicitação com status próprio. | Registrar e acompanhar as solicitações. |
| Regras de exclusão e integridade sem definição uniforme no modelo. | Chaves estrangeiras com `RESTRICT`. | Preservar registros relacionados. |
| Regras de unicidade a serem protegidas. | Restrições `unique` e restrição composta. | Evitar dados duplicados. |

## 3. Chaves estrangeiras e onDelete

| Relação | onDelete | Justificativa de negócio |
|---|---|---|
| Objeto → Categoria | RESTRICT | Impede excluir uma categoria utilizada por objetos cadastrados. |
| Objeto → Local | RESTRICT | Preserva a localização dos objetos registrados. |
| Objeto → Usuário | RESTRICT | Mantém a identificação de quem cadastrou o objeto. |
| Solicitação → Usuário | RESTRICT | Preserva o usuário responsável pela solicitação. |
| Solicitação → Objeto | RESTRICT | Preserva as solicitações vinculadas ao objeto. |
| Devolução → Objeto | RESTRICT | Evita perder o registro de devolução associado ao objeto. |
| Devolução → Usuário | RESTRICT | Preserva a identificação de quem registrou a devolução. |

Foi escolhido `RESTRICT` para impedir que a exclusão de um registro provoque a perda de informações importantes do sistema. As relações são obrigatórias (`nullable: false`), por isso `SET NULL` não é adequado.

## 4. Restrições de integridade

| Restrição | Regra protegida |
|---|---|
| `UNIQUE` em `categorias.nome` | Impede categorias com nomes duplicados. |
| `UNIQUE` em `locais.nome` | Impede locais com nomes duplicados. |
| `UNIQUE` em `usuarios.email` | Impede usuários com o mesmo e-mail. |
| `UQ_solicitacoes_usuario_objeto` | Impede que o mesmo usuário solicite o mesmo objeto mais de uma vez. |
| Unicidade de `devolucoes.objeto_id` | Impede mais de uma devolução para o mesmo objeto. |

A restrição composta de Solicitação foi definida com:

`@Unique('UQ_solicitacoes_usuario_objeto', ['usuario', 'objeto'])`

Além disso, as colunas foram revisadas: identificadores UUID, campos obrigatórios e opcionais com nulabilidade definida, tipos `enum` para situações e `timestamptz` para datas e horários. Não há campo monetário que necessite de `decimal`.

## 5. Verificação

### 5.1. Migrações

As migrações foram executadas no banco vazio achados_perdidos_verificacao. Foram identificadas nove migrações pendentes e todas foram executadas com sucesso.

Log completo do migration:run:

````text

> backend@0.0.1 migration:run
> tsx ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts

[90m[4mquery:[24m[39m [94mSELECT[0m [95mversion[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m*[0m [94mFROM[0m [95mcurrent_schema[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mCREATE[0m [37mEXTENSION[0m [94mIF[0m [94mNOT[0m [94mEXISTS[0m [37m"uuid-ossp"[0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m*[0m [94mFROM[0m [37m"information_schema"[0m[37m.[0m[37m"tables"[0m [94mWHERE[0m [37m"table_schema"[0m [37m=[0m [37m$[0m[32m1[0m [94mAND[0m [37m"table_name"[0m [37m=[0m [37m$[0m[32m2[0m [90m-- PARAMETERS: ["public","migrations"][0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"migrations"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"timestamp"[0m [37mbigint[0m [94mNOT NULL[0m[37m,[0m [37m"name"[0m [37mcharacter[0m [37mvarying[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_8c82d7f526340ab734260ea46be"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m*[0m [94mFROM[0m [37m"migrations"[0m [37m"migrations"[0m [94mORDER BY[0m [37m"id"[0m [94mDESC[0m
[4m0 migrations are already loaded in the database.[24m
[4m9 migrations were found in the source code.[24m
[4m9 migrations are new migrations must be executed.[24m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"usuarios"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"nome"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m150[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m"email"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m"tipo"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m20[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"UQ_446adfc18b35418aac32ae0b7b5"[0m [94mUNIQUE[0m [37m([0m[37m"email"[0m[37m)[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_d7281c63c176e152e4c531594a8"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792722918383,"CriarUsuarios1792722918383"][0m
[4mMigration CriarUsuarios1792722918383 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"categorias"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"nome"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m100[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"UQ_de8a2d8979f7820616e31dc1e15"[0m [94mUNIQUE[0m [37m([0m[37m"nome"[0m[37m)[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_3886a26251605c571c6b4f861fe"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"locais"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"nome"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m150[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"UQ_64320ca4be574b81c57b95484bb"[0m [94mUNIQUE[0m [37m([0m[37m"nome"[0m[37m)[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_42eaed01557782613d36365d300"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"objetos"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"nome"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m150[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m"descricao"[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m"dataEncontrado"[0m [94mTIMESTAMP[0m [94mNOT NULL[0m[37m,[0m [37m"status"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m20[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'encontrado'[0m[37m,[0m [37m"categoria_id"[0m [94minteger[0m [94mNOT NULL[0m[37m,[0m [37m"local_id"[0m [94minteger[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_5f2898ccbd673819ed827b32a91"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m"devolucoes"[0m [37m([0m[37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m [37m"dataDevolucao"[0m [94mTIMESTAMP[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mnow[0m[37m([0m[37m)[0m[37m,[0m [37m"objeto_id"[0m [94minteger[0m [94mNOT NULL[0m[37m,[0m [94mCONSTRAINT[0m [37m"REL_9ff892c612f28f70e177f5a387"[0m [94mUNIQUE[0m [37m([0m[37m"objeto_id"[0m[37m)[0m[37m,[0m [94mCONSTRAINT[0m [37m"PK_e89335b8032acafded142bbbff1"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mADD CONSTRAINT[0m [37m"FK_1e1425c88011c24bdf5c17f4ebf"[0m [94mFOREIGN KEY[0m [37m([0m[37m"categoria_id"[0m[37m)[0m [94mREFERENCES[0m [37m"categorias"[0m[37m([0m[37m"id"[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mADD CONSTRAINT[0m [37m"FK_44bf3f10332412700dcb7d98c76"[0m [94mFOREIGN KEY[0m [37m([0m[37m"local_id"[0m[37m)[0m [94mREFERENCES[0m [37m"locais"[0m[37m([0m[37m"id"[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"devolucoes"[0m [94mADD CONSTRAINT[0m [37m"FK_9ff892c612f28f70e177f5a387b"[0m [94mFOREIGN KEY[0m [37m([0m[37m"objeto_id"[0m[37m)[0m [94mREFERENCES[0m [37m"objetos"[0m[37m([0m[37m"id"[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792769989722,"AdicionarEntidadesMvp1792769989722"][0m
[4mMigration AdicionarEntidadesMvp1792769989722 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mADD[0m [37m"usuario_id"[0m [94minteger[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"devolucoes"[0m [94mADD[0m [37m"usuario_id"[0m [94minteger[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mADD CONSTRAINT[0m [37m"FK_ea2eeedd230bea363eb01861857"[0m [94mFOREIGN KEY[0m [37m([0m[37m"usuario_id"[0m[37m)[0m [94mREFERENCES[0m [37m"usuarios"[0m[37m([0m[37m"id"[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"devolucoes"[0m [94mADD CONSTRAINT[0m [37m"FK_bab7768fc5ef5a189f3ea9a91a3"[0m [94mFOREIGN KEY[0m [37m([0m[37m"usuario_id"[0m[37m)[0m [94mREFERENCES[0m [37m"usuarios"[0m[37m([0m[37m"id"[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792770928974,"RelacionarUsuariosObjetosDevolucoes1792770928974"][0m
[4mMigration RelacionarUsuariosObjetosDevolucoes1792770928974 has been executed successfully.[24m
[90m[4mquery:[24m[39m
      [94mINSERT INTO[0m [37m"categorias"[0m [37m([0m[37m"nome"[0m[37m)[0m
      [94mVALUES[0m
        [37m([0m[37m'Eletr├┤nicos'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Documentos'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Material escolar'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Roupas e acess├│rios'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Chaves'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Outros'[0m[37m)[0m
      [94mON[0m [95mCONFLICT[0m [37m([0m[37m"nome"[0m[37m)[0m [37mDO[0m [37mNOTHING[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mINSERT INTO[0m [37m"locais"[0m [37m([0m[37m"nome"[0m[37m)[0m
      [94mVALUES[0m
        [37m([0m[37m'Biblioteca'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Laborat├│rio'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Sala de aula'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Cantina'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'├ürea de conviv├¬ncia'[0m[37m)[0m[37m,[0m
        [37m([0m[37m'Outros'[0m[37m)[0m
      [94mON[0m [95mCONFLICT[0m [37m([0m[37m"nome"[0m[37m)[0m [37mDO[0m [37mNOTHING[0m[37m;[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792774193231,"CadastrarCategoriasELocais1792774193231"][0m
[4mMigration CadastrarCategoriasELocais1792774193231 has been executed successfully.[24m
[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37m"categorias"[0m
      [94mADD[0m [94mCOLUMN[0m [37m"descricao"[0m [94mtext[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37m"locais"[0m
      [94mADD[0m [94mCOLUMN[0m [37m"descricao"[0m [94mtext[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792800000000,"AdicionarDescricaoCategoriasLocais1792800000000"][0m
[4mMigration AdicionarDescricaoCategoriasLocais1792800000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37m"devolucoes"[0m
      [94mADD[0m [94mCOLUMN[0m [37m"observacao"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m500[0m[37m)[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1792900000000,"AdicionarObservacaoDevolucoes1792900000000"][0m
[4mMigration AdicionarObservacaoDevolucoes1792900000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m
      [94mCREATE TABLE[0m [37m"solicitacoes"[0m [37m([0m
        [37m"id"[0m [37mSERIAL[0m [94mNOT NULL[0m[37m,[0m
        [37m"usuario_id"[0m [94minteger[0m [94mNOT NULL[0m[37m,[0m
        [37m"objeto_id"[0m [94minteger[0m [94mNOT NULL[0m[37m,[0m
        [37m"status"[0m [37mcharacter[0m [95mvarying[0m[37m([0m[32m20[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'pendente'[0m[37m,[0m
        [94mCONSTRAINT[0m [37m"PK_solicitacoes"[0m [94mPRIMARY KEY[0m [37m([0m[37m"id"[0m[37m)[0m[37m,[0m
        [94mCONSTRAINT[0m [37m"FK_solicitacoes_usuario"[0m
          [94mFOREIGN KEY[0m [37m([0m[37m"usuario_id"[0m[37m)[0m
          [94mREFERENCES[0m [37m"usuarios"[0m[37m([0m[37m"id"[0m[37m)[0m
          [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m
          [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m[37m,[0m
        [94mCONSTRAINT[0m [37m"FK_solicitacoes_objeto"[0m
          [94mFOREIGN KEY[0m [37m([0m[37m"objeto_id"[0m[37m)[0m
          [94mREFERENCES[0m [37m"objetos"[0m[37m([0m[37m"id"[0m[37m)[0m
          [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m
          [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m[37m,[0m
        [94mCONSTRAINT[0m [37m"CHK_solicitacoes_status"[0m
          [94mCHECK[0m [37m([0m[37m"status"[0m [94mIN[0m [37m([0m[37m'pendente'[0m[37m,[0m [37m'aprovada'[0m[37m,[0m [37m'recusada'[0m[37m)[0m[37m)[0m
      [37m)[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1793000000000,"CriarSolicitacoes1793000000000"][0m
[4mMigration CriarSolicitacoes1793000000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37m"solicitacoes"[0m
      [94mADD CONSTRAINT[0m [37m"UQ_solicitacoes_usuario_objeto"[0m
      [94mUNIQUE[0m [37m([0m[37m"usuario_id"[0m[37m,[0m [37m"objeto_id"[0m[37m)[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1793100000000,"ImpedirSolicitacoesDuplicadas1793100000000"][0m
[4mMigration ImpedirSolicitacoesDuplicadas1793100000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"usuarios"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"usuarios"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"usuarios"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"categorias"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"categorias"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"categorias"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"locais"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"locais"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"locais"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"objetos"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"objetos"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"devolucoes"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"devolucoes"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"devolucoes"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"solicitacoes"[0m [94mADD[0m [94mCOLUMN[0m [37m"id_uuid"[0m [37muuid[0m
[90m[4mquery:[24m[39m [94mUPDATE[0m [37m"solicitacoes"[0m [94mSET[0m [37m"id_uuid"[0m [37m=[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m"solicitacoes"[0m [94mALTER COLUMN[0m [37m"id_uuid"[0m [94mSET[0m [94mNOT NULL[0m
[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37mobjetos[0m
        [94mADD[0m [94mCOLUMN[0m [37mcategoria_id_uuid[0m [37muuid[0m[37m,[0m
        [94mADD[0m [94mCOLUMN[0m [37mlocal_id_uuid[0m [37muuid[0m[37m,[0m
        [94mADD[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [37muuid[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mADD[0m [94mCOLUMN[0m [37mobjeto_id_uuid[0m [37muuid[0m[37m,[0m
        [94mADD[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [37muuid[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mADD[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [37muuid[0m[37m,[0m
        [94mADD[0m [94mCOLUMN[0m [37mobjeto_id_uuid[0m [37muuid[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mUPDATE[0m [37mobjetos[0m [37mo[0m
      [94mSET[0m [37mcategoria_id_uuid[0m [37m=[0m [37mc[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37mcategorias[0m [37mc[0m
      [94mWHERE[0m [37mo[0m[37m.[0m[37mcategoria_id[0m [37m=[0m [37mc[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37mobjetos[0m [37mo[0m
      [94mSET[0m [37mlocal_id_uuid[0m [37m=[0m [37ml[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37mlocais[0m [37ml[0m
      [94mWHERE[0m [37mo[0m[37m.[0m[37mlocal_id[0m [37m=[0m [37ml[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37mobjetos[0m [37mo[0m
      [94mSET[0m [37musuario_id_uuid[0m [37m=[0m [37mu[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37musuarios[0m [37mu[0m
      [94mWHERE[0m [37mo[0m[37m.[0m[37musuario_id[0m [37m=[0m [37mu[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37mdevolucoes[0m [37md[0m
      [94mSET[0m [37mobjeto_id_uuid[0m [37m=[0m [37mo[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37mobjetos[0m [37mo[0m
      [94mWHERE[0m [37md[0m[37m.[0m[37mobjeto_id[0m [37m=[0m [37mo[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37mdevolucoes[0m [37md[0m
      [94mSET[0m [37musuario_id_uuid[0m [37m=[0m [37mu[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37musuarios[0m [37mu[0m
      [94mWHERE[0m [37md[0m[37m.[0m[37musuario_id[0m [37m=[0m [37mu[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37msolicitacoes[0m [37ms[0m
      [94mSET[0m [37mobjeto_id_uuid[0m [37m=[0m [37mo[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37mobjetos[0m [37mo[0m
      [94mWHERE[0m [37ms[0m[37m.[0m[37mobjeto_id[0m [37m=[0m [37mo[0m[37m.[0m[37mid[0m[37m;[0m

      [94mUPDATE[0m [37msolicitacoes[0m [37ms[0m
      [94mSET[0m [37musuario_id_uuid[0m [37m=[0m [37mu[0m[37m.[0m[37mid_uuid[0m
      [94mFROM[0m [37musuarios[0m [37mu[0m
      [94mWHERE[0m [37ms[0m[37m.[0m[37musuario_id[0m [37m=[0m [37mu[0m[37m.[0m[37mid[0m[37m;[0m

[90m[4mquery:[24m[39m
      [37mDO[0m [37m$[0m[37m$[0m
      [94mBEGIN[0m
        [94mIF[0m [94mEXISTS[0m [37m([0m
          [94mSELECT[0m [32m1[0m [94mFROM[0m [37mobjetos[0m
          [94mWHERE[0m [37mcategoria_id_uuid[0m [94mIS NULL[0m
             [94mOR[0m [37mlocal_id_uuid[0m [94mIS NULL[0m
             [94mOR[0m [37musuario_id_uuid[0m [94mIS NULL[0m
        [37m)[0m [94mOR[0m [94mEXISTS[0m [37m([0m
          [94mSELECT[0m [32m1[0m [94mFROM[0m [37mdevolucoes[0m
          [94mWHERE[0m [37mobjeto_id_uuid[0m [94mIS NULL[0m [94mOR[0m [37musuario_id_uuid[0m [94mIS NULL[0m
        [37m)[0m [94mOR[0m [94mEXISTS[0m [37m([0m
          [94mSELECT[0m [32m1[0m [94mFROM[0m [37msolicitacoes[0m
          [94mWHERE[0m [37mobjeto_id_uuid[0m [94mIS NULL[0m [94mOR[0m [37musuario_id_uuid[0m [94mIS NULL[0m
        [37m)[0m [94mTHEN[0m
          [37mRAISE[0m [37mEXCEPTION[0m [37m'Falha ao converter relacionamentos para UUID'[0m[37m;[0m
        [94mEND[0m [94mIF[0m[37m;[0m
      [94mEND[0m [37m$[0m[37m$[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37mobjetos[0m
        [94mDROP CONSTRAINT[0m [37m"FK_1e1425c88011c24bdf5c17f4ebf"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"FK_44bf3f10332412700dcb7d98c76"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"FK_ea2eeedd230bea363eb01861857"[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mDROP CONSTRAINT[0m [37m"FK_9ff892c612f28f70e177f5a387b"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"FK_bab7768fc5ef5a189f3ea9a91a3"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"REL_9ff892c612f28f70e177f5a387"[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mDROP CONSTRAINT[0m [37m"FK_solicitacoes_usuario"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"FK_solicitacoes_objeto"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"UQ_solicitacoes_usuario_objeto"[0m[37m,[0m
        [94mDROP CONSTRAINT[0m [37m"CHK_solicitacoes_status"[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37musuarios[0m
        [94mDROP CONSTRAINT[0m [37m"PK_d7281c63c176e152e4c531594a8"[0m[37m;[0m

      [94mALTER TABLE[0m [37mcategorias[0m
        [94mDROP CONSTRAINT[0m [37m"PK_3886a26251605c571c6b4f861fe"[0m[37m;[0m

      [94mALTER TABLE[0m [37mlocais[0m
        [94mDROP CONSTRAINT[0m [37m"PK_42eaed01557782613d36365d300"[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m
        [94mDROP CONSTRAINT[0m [37m"PK_5f2898ccbd673819ed827b32a91"[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mDROP CONSTRAINT[0m [37m"PK_e89335b8032acafded142bbbff1"[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mDROP CONSTRAINT[0m [37m"PK_solicitacoes"[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37musuarios[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mcategorias[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mlocais[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mdevolucoes[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37msolicitacoes[0m [94mDROP COLUMN[0m [37mid[0m[37m;[0m

      [94mALTER TABLE[0m [37musuarios[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mcategorias[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mlocais[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37mdevolucoes[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m
      [94mALTER TABLE[0m [37msolicitacoes[0m [37mRENAME[0m [94mCOLUMN[0m [37mid_uuid[0m [94mTO[0m [37mid[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m [94mDROP COLUMN[0m [37mcategoria_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [94mDROP COLUMN[0m [37mlocal_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [94mDROP COLUMN[0m [37musuario_id[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m [37mRENAME[0m [94mCOLUMN[0m [37mcategoria_id_uuid[0m [94mTO[0m [37mcategoria_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [37mRENAME[0m [94mCOLUMN[0m [37mlocal_id_uuid[0m [94mTO[0m [37mlocal_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [37mRENAME[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [94mTO[0m [37musuario_id[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m [94mDROP COLUMN[0m [37mobjeto_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mdevolucoes[0m [94mDROP COLUMN[0m [37musuario_id[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m [37mRENAME[0m [94mCOLUMN[0m [37mobjeto_id_uuid[0m [94mTO[0m [37mobjeto_id[0m[37m;[0m
      [94mALTER TABLE[0m [37mdevolucoes[0m [37mRENAME[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [94mTO[0m [37musuario_id[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m [94mDROP COLUMN[0m [37mobjeto_id[0m[37m;[0m
      [94mALTER TABLE[0m [37msolicitacoes[0m [94mDROP COLUMN[0m [37musuario_id[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m [37mRENAME[0m [94mCOLUMN[0m [37mobjeto_id_uuid[0m [94mTO[0m [37mobjeto_id[0m[37m;[0m
      [94mALTER TABLE[0m [37msolicitacoes[0m [37mRENAME[0m [94mCOLUMN[0m [37musuario_id_uuid[0m [94mTO[0m [37musuario_id[0m[37m;[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"usuarios"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"categorias"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"locais"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"objetos"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"devolucoes"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
        [94mALTER TABLE[0m [37m"solicitacoes"[0m
        [94mALTER COLUMN[0m [37mid[0m [94mSET[0m [94mDEFAULT[0m [95mgen_random_uuid[0m[37m([0m[37m)[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37musuarios[0m [94mADD CONSTRAINT[0m [37mPK_usuarios[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m
      [94mALTER TABLE[0m [37mcategorias[0m [94mADD CONSTRAINT[0m [37mPK_categorias[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m
      [94mALTER TABLE[0m [37mlocais[0m [94mADD CONSTRAINT[0m [37mPK_locais[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m
      [94mALTER TABLE[0m [37mobjetos[0m [94mADD CONSTRAINT[0m [37mPK_objetos[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m
      [94mALTER TABLE[0m [37mdevolucoes[0m [94mADD CONSTRAINT[0m [37mPK_devolucoes[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m
      [94mALTER TABLE[0m [37msolicitacoes[0m [94mADD CONSTRAINT[0m [37mPK_solicitacoes[0m [94mPRIMARY KEY[0m [37m([0m[37mid[0m[37m)[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mCREATE[0m [37mTYPE[0m [37musuarios_tipo_enum[0m [94mAS[0m [95mENUM[0m [37m([0m[37m'aluno'[0m[37m,[0m [37m'docente'[0m[37m)[0m[37m;[0m
      [94mCREATE[0m [37mTYPE[0m [37mobjetos_status_enum[0m [94mAS[0m [95mENUM[0m [37m([0m[37m'encontrado'[0m[37m,[0m [37m'devolvido'[0m[37m)[0m[37m;[0m
      [94mCREATE[0m [37mTYPE[0m [37msolicitacoes_status_enum[0m [94mAS[0m [95mENUM[0m [37m([0m[37m'pendente'[0m[37m,[0m [37m'aprovada'[0m[37m,[0m [37m'recusada'[0m[37m)[0m[37m;[0m

      [94mALTER TABLE[0m [37musuarios[0m
        [94mALTER COLUMN[0m [37mtipo[0m [37mTYPE[0m [37musuarios_tipo_enum[0m [37mUSING[0m [37mtipo[0m[37m:[0m[37m:[0m[37musuarios_tipo_enum[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m
        [94mALTER COLUMN[0m [37mstatus[0m [94mDROP DEFAULT[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m
        [94mALTER COLUMN[0m [37mstatus[0m [37mTYPE[0m [37mobjetos_status_enum[0m [37mUSING[0m [37mstatus[0m[37m:[0m[37m:[0m[37mobjetos_status_enum[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m
        [94mALTER COLUMN[0m [37mstatus[0m [94mSET[0m [94mDEFAULT[0m [37m'encontrado'[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mALTER COLUMN[0m [37mstatus[0m [94mDROP DEFAULT[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mALTER COLUMN[0m [37mstatus[0m [37mTYPE[0m [37msolicitacoes_status_enum[0m [37mUSING[0m [37mstatus[0m[37m:[0m[37m:[0m[37msolicitacoes_status_enum[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mALTER COLUMN[0m [37mstatus[0m [94mSET[0m [94mDEFAULT[0m [37m'pendente'[0m[37m;[0m

      [94mALTER TABLE[0m [37mobjetos[0m
        [94mALTER COLUMN[0m [37m"dataEncontrado"[0m [37mTYPE[0m [37mtimestamptz[0m
        [37mUSING[0m [37m"dataEncontrado"[0m [37mAT[0m [37mTIME[0m [37mZONE[0m [37m'UTC'[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mALTER COLUMN[0m [37m"dataDevolucao"[0m [94mDROP DEFAULT[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mALTER COLUMN[0m [37m"dataDevolucao"[0m [37mTYPE[0m [37mtimestamptz[0m
        [37mUSING[0m [37m"dataDevolucao"[0m [37mAT[0m [37mTIME[0m [37mZONE[0m [37m'UTC'[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mALTER COLUMN[0m [37m"dataDevolucao"[0m [94mSET[0m [94mDEFAULT[0m [95mnow[0m[37m([0m[37m)[0m[37m;[0m

[90m[4mquery:[24m[39m
      [94mALTER TABLE[0m [37mobjetos[0m
        [94mADD CONSTRAINT[0m [37mFK_objetos_categoria[0m
          [94mFOREIGN KEY[0m [37m([0m[37mcategoria_id[0m[37m)[0m [94mREFERENCES[0m [95mcategorias[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mFK_objetos_local[0m
          [94mFOREIGN KEY[0m [37m([0m[37mlocal_id[0m[37m)[0m [94mREFERENCES[0m [95mlocais[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mFK_objetos_usuario[0m
          [94mFOREIGN KEY[0m [37m([0m[37musuario_id[0m[37m)[0m [94mREFERENCES[0m [95musuarios[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m;[0m

      [94mALTER TABLE[0m [37mdevolucoes[0m
        [94mADD CONSTRAINT[0m [37mFK_devolucoes_objeto[0m
          [94mFOREIGN KEY[0m [37m([0m[37mobjeto_id[0m[37m)[0m [94mREFERENCES[0m [95mobjetos[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mFK_devolucoes_usuario[0m
          [94mFOREIGN KEY[0m [37m([0m[37musuario_id[0m[37m)[0m [94mREFERENCES[0m [95musuarios[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mUQ_devolucoes_objeto[0m [94mUNIQUE[0m [37m([0m[37mobjeto_id[0m[37m)[0m[37m;[0m

      [94mALTER TABLE[0m [37msolicitacoes[0m
        [94mADD CONSTRAINT[0m [37mFK_solicitacoes_usuario[0m
          [94mFOREIGN KEY[0m [37m([0m[37musuario_id[0m[37m)[0m [94mREFERENCES[0m [95musuarios[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mFK_solicitacoes_objeto[0m
          [94mFOREIGN KEY[0m [37m([0m[37mobjeto_id[0m[37m)[0m [94mREFERENCES[0m [95mobjetos[0m[37m([0m[37mid[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mRESTRICT[0m[37m,[0m
        [94mADD CONSTRAINT[0m [37mUQ_solicitacoes_usuario_objeto[0m
          [94mUNIQUE[0m [37m([0m[37musuario_id[0m[37m,[0m [37mobjeto_id[0m[37m)[0m[37m;[0m

[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m"migrations"[0m[37m([0m[37m"timestamp"[0m[37m,[0m [37m"name"[0m[37m)[0m [94mVALUES[0m [37m([0m[37m$[0m[32m1[0m[37m,[0m [37m$[0m[32m2[0m[37m)[0m [90m-- PARAMETERS: [1794005317985,"ConverterIdsIntegerParaUuid1794005317985"][0m
[4mMigration ConverterIdsIntegerParaUuid1794005317985 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mCOMMIT[0m

````

Também foi testado migration:revert, com reversão e reaplicação da última migração.

### 5.2. Listagem de objetos e relacionamentos

Foi realizada a requisição:

```powershell
curl.exe -i "http://localhost:3000/objetos"
```

Resultado: `HTTP 200 OK`.

A resposta apresentou 2 objetos, com paginação (`pagina: 1`, `limite: 10`).

O log SQL demonstrou o uso de `INNER JOIN` com as tabelas `categorias`, `locais` e `usuarios`. A listagem utilizou 2 consultas SQL: uma para selecionar os IDs paginados e outra para carregar os objetos e seus relacionamentos.

Assim, os relacionamentos são carregados em conjunto, sem consultas individuais para cada objeto, evitando o problema N+1.

### 5.3. Teste de restrição de duplicidade

Foi realizada uma tentativa de cadastrar novamente uma solicitação para o mesmo usuário e objeto:

```powershell
curl.exe -i -X POST http://localhost:3000/solicitacoes -H "Content-Type: application/json" -d '{"usuarioId":"651b20ef-5928-41dc-9474-fcca74d0d78b","objetoId":"ad4e0b40-61be-4f64-8cf5-a71e32e985fa","status":"pendente"}'
```

Resultado: `HTTP 409 Conflict`.

Resposta da API:

```json
{
  "message": "Este usuário já possui uma solicitação para este objeto",
  "error": "Conflict",
  "statusCode": 409
}
```

A API impediu o cadastro duplicado e tratou a violação da regra de negócio sem retornar erro interno `500`.
