
import { Controller, Get, Query } from '@nestjs/common';

import { ObjetoRespostaDto } from './dto/objeto-resposta.dto.js';
import { ListarObjetosQueryDto } from './dto/listar-objetos-query.dto.js';
import { paraObjetoResposta } from './dto/objeto-resposta.mapper.js';
import { ListarObjetosService } from './listar-objetos.service.js';

@Controller('objetos')
export class ObjetosController {
  constructor(
    private readonly listarObjetosService: ListarObjetosService,
  ) {}

  @Get()
  async listar(
    @Query() query: ListarObjetosQueryDto,
  ): Promise<{
    objetos: ObjetoRespostaDto[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const { page, limit } = query;

    const { objetos, total } =
      await this.listarObjetosService.listar(query);

    return {
      objetos: objetos.map((objeto) =>
        paraObjetoResposta(objeto),
      ),
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
    };
  }
}
