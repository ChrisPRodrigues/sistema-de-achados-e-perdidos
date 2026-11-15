
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { ConsultasController } from './consultas.controller.js';
import { ConsultasService } from './consultas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ObjetoEntity])],
  controllers: [ConsultasController],
  providers: [ConsultasService],
  exports: [ConsultasService],
})
export class ConsultasModule {}
