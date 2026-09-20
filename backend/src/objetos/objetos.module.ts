import { Module } from '@nestjs/common';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';
import { ObjetosController } from './objetos.controller.js';

@Module({
  providers: [ObjetosRepositoryService],
  exports: [ObjetosRepositoryService],
  controllers: [ObjetosController],
})
export class ObjetosModule {}
