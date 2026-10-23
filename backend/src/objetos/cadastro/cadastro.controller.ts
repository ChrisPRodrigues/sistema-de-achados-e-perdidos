import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { CadastroService } from './cadastro.service.js';
import { ObjetoEntity } from '../entities/objeto.entity.js';

type DadosCadastroObjeto = {
  nome: string;
  descricao: string;
  categoriaId: number;
  localId: number;
  usuarioId: number;
  dataEncontrado: Date;
};

@Controller('objetos')
export class CadastroController {
  constructor(
    private readonly cadastroService: CadastroService,
  ) {}

  @Post()
  cadastrar(
    @Body() dados: DadosCadastroObjeto,
  ): Promise<ObjetoEntity> {
    return this.cadastroService.cadastrar(dados);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjetoEntity> {
    return this.cadastroService.buscarPorId(id);
  }
}