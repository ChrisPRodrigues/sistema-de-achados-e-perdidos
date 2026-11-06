import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';
import { AtualizarObjetoDto } from '../dto/atualizar-objeto.dto.js';
import { RegistrarDevolucaoDto } from '../../devolucoes/dto/registrar-devolucao.dto.js';
import { ObjetoRespostaDto } from '../dto/objeto-resposta.dto.js';
import { paraObjetoResposta } from '../dto/objeto-resposta.mapper.js';

@Controller('objetos')
export class GerenciamentoController {
  constructor(
    private readonly gerenciamentoService: GerenciamentoService,
  ) {}

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: AtualizarObjetoDto,
  ): Promise<ObjetoRespostaDto> {
    const objetoAtualizado =
      await this.gerenciamentoService.atualizar(id, dados);

    return paraObjetoResposta(objetoAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.gerenciamentoService.remover(id);
  }

  @Patch(':id/devolucao')
  async devolver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: RegistrarDevolucaoDto,
  ): Promise<ObjetoRespostaDto> {
    const objetoDevolvido =
      await this.gerenciamentoService.devolver(
        id,
        dados.usuarioId,
        dados.observacao,
      );

    return paraObjetoResposta(objetoDevolvido);
  }
}