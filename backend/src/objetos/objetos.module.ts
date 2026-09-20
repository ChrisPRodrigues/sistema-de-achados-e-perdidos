import { Module } from '@nestjs/common';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';
import { CadastroController } from './cadastro/cadastro.controller.js';
import { CadastroService } from './cadastro/cadastro.service.js';

@Module({
  providers: [ObjetosRepositoryService, CadastroService],
  exports: [ObjetosRepositoryService],
  controllers: [CadastroController],
})
export class ObjetosModule {}
