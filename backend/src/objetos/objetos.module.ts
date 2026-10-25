import { Module, forwardRef } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { CategoriasModule } from '../categorias/categorias.module.js';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';
import { ObjetosController } from './objetos.controller.js';
import { CadastroController } from './cadastro/cadastro.controller.js';
import { CadastroService } from './cadastro/cadastro.service.js';
import { GerenciamentoController } from './gerenciamento/gerenciamento.controller.js';
import { GerenciamentoService } from './gerenciamento/gerenciamento.service.js';
import { DevolucoesModule } from '../devolucoes/devolucoes.module.js';

@Module({
  imports: [
    CategoriasModule,
    forwardRef(() => DevolucoesModule),
    UsuariosModule,
  ],
  providers: [
    ObjetosRepositoryService,
    CadastroService,
    GerenciamentoService,
  ],
  exports: [
    ObjetosRepositoryService,
  ],
  controllers: [
    ObjetosController,
    CadastroController,
    GerenciamentoController,
  ],
})
export class ObjetosModule {}
