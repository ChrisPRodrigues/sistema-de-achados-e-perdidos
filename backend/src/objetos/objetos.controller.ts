import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjetoEntity } from './entities/objeto.entity.js';
import { ObjetoRespostaDto } from './dto/objeto-resposta.dto.js';
import { ListarObjetosQueryDto } from './dto/listar-objetos-query.dto.js';
import { paraObjetoResposta } from './dto/objeto-resposta.mapper.js';

@Controller('objetos')
export class ObjetosController {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
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

    const [objetos, total] =
      await this.objetosRepository.findAndCount({
        relations: {
          categoria: true,
          localEncontrado: true,
          usuario: true,
        },
        relationLoadStrategy: 'join',
        skip: (page - 1) * limit,
        take: limit,
        order: {
          id: 'ASC',
        },
      });

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