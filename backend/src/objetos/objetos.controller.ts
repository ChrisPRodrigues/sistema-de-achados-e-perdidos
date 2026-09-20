import { Controller, Get } from '@nestjs/common';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';

@Controller('objetos')
export class ObjetosController {
  constructor(
    private readonly objetosRepository: ObjetosRepositoryService,
  ) {}

  @Get()
  listar() {
    return this.objetosRepository.listar();
  }
}