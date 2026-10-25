import { Module, forwardRef } from '@nestjs/common';
import { ObjetosModule } from '../objetos/objetos.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { DevolucaoController } from './devolucao.controller.js';
import { DevolucaoService } from './devolucao.service.js';
import { DevolucaoRepository } from './devolucao.repository.js';

@Module({
  imports: [
    forwardRef(() => ObjetosModule),
    UsuariosModule,
  ],

  controllers: [DevolucaoController],
  providers:[
    DevolucaoService,
    DevolucaoRepository,
  ],

  exports: [
    DevolucaoRepository,
  ],
})
export class DevolucoesModule {}