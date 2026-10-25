
import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjetoEntity } from './entities/objeto.entity.js';

@Controller('objetos')
export class ObjetosController {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  @Get()
  listar(): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      relations: {
        categoria: true,
        localEncontrado: true,
        usuario: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }
}
