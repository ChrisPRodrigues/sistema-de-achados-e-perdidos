import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjetoEntity } from './entities/objeto.entity.js';
import { CategoriaEntity } from '../categorias/entities/categoria.entity.js';
import { LocalEntity } from '../locais/entities/local.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { DevolucaoEntity } from '../devolucoes/entities/devolucao.entity.js';

import { ObjetosController } from './objetos.controller.js';
import { CadastroController } from './cadastro/cadastro.controller.js';
import { CadastroService } from './cadastro/cadastro.service.js';
import { GerenciamentoController } from './gerenciamento/gerenciamento.controller.js';
import { GerenciamentoService } from './gerenciamento/gerenciamento.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjetoEntity,
      CategoriaEntity,
      LocalEntity,
      UsuarioEntity,
      DevolucaoEntity,
    ]),
  ],
  providers: [CadastroService, GerenciamentoService],
  controllers: [
    ObjetosController,
    CadastroController,
    GerenciamentoController,
  ],
})
export class ObjetosModule {}