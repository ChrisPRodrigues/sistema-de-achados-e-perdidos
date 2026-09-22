import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CadastroService } from './cadastro.service.js';
import type { Objeto } from '../models/objeto/objeto.interface.js';

@Controller('objetos')
export class CadastroController {
  constructor(private readonly cadastroService: CadastroService) {}

  @Post()
  cadastrar(@Body() dados: Omit<Objeto, 'id' | 'status'>): Objeto {
    return this.cadastroService.cadastrar(dados);
  }
  @Get(':id')
  buscarPorId(@Param('id') id: string): Objeto {
    return this.cadastroService.buscarPorId(Number(id));
  }
}
