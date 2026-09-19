import { Module } from '@nestjs/common';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';

@Module({
  providers: [ObjetosRepositoryService],
  exports: [ObjetosRepositoryService],
})
export class ObjetosModule {}
