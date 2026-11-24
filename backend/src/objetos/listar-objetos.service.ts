
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  FindOptionsWhere,
} from 'typeorm';

import { ObjetoEntity } from './entities/objeto.entity.js';
import { ListarObjetosQueryDto } from './dto/listar-objetos-query.dto.js';

@Injectable()
export class ListarObjetosService {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  async listar(query: ListarObjetosQueryDto): Promise<{
    objetos: ObjetoEntity[];
    total: number;
  }> {
    const { page, limit, nome, status, categoriaId, localId } = query;

    const where: FindOptionsWhere<ObjetoEntity> = {};

    if (nome?.trim()) {
      where.nome = ILike(`%${nome.trim()}%`);
    }

    if (status) {
      where.status = status;
    }

    if (categoriaId) {
      where.categoria = { id: categoriaId };
    }

    if (localId) {
      where.localEncontrado = { id: localId };
    }

    const [objetos, total] =
      await this.objetosRepository.findAndCount({
        where,
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

    return { objetos, total };
  }
}
