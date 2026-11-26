import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CadastroService } from './cadastro.service.js';
import { CriarObjetoDto } from '../dto/criar-objeto.dto.js';
import { ObjetoRespostaDto } from '../dto/objeto-resposta.dto.js';
import { paraObjetoResposta } from '../dto/objeto-resposta.mapper.js';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

import { UsuarioAtual } from '../../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../../auth/decorators/usuario-atual.decorator.js';

@Controller('objetos')
export class CadastroController {
  constructor(
    private readonly cadastroService: CadastroService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente')
  async cadastrar(
    @Body() dados: CriarObjetoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<ObjetoRespostaDto> {
    const novoObjeto =
      await this.cadastroService.cadastrar(
        dados,
        usuario,
      );

    return paraObjetoResposta(novoObjeto);
  }

  @Get(':id')
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ObjetoRespostaDto> {
    const objeto =
      await this.cadastroService.buscarPorId(id);

    return paraObjetoResposta(objeto);
  }
}