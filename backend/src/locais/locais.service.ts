import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LocalEntity } from './entities/local.entity.js';
import { CriarLocalDto } from './dto/criar-local.dto.js';
import { AtualizarLocalDto } from './dto/atualizar-local.dto.js';

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(LocalEntity)
    private readonly locaisRepository: Repository<LocalEntity>,
  ) {}

  async listar(): Promise<LocalEntity[]> {
    return this.locaisRepository.find();
  }

  async buscarPorId(id: number): Promise<LocalEntity> {
    const local = await this.locaisRepository.findOne({
      where: { id },
    });

    if (!local) {
      throw new NotFoundException('Local não encontrado');
    }

    return local;
  }

  async adicionar(dados: CriarLocalDto): Promise<LocalEntity> {
    const nome = dados.nome.trim();

    const localExistente = await this.locaisRepository.findOne({
      where: { nome },
    });

    if (localExistente) {
      throw new ConflictException('Local já cadastrado');
    }

    const novoLocal = this.locaisRepository.create({
      nome,
    });

    return this.locaisRepository.save(novoLocal);
  }

  async atualizar(
    id: number,
    dados: AtualizarLocalDto,
  ): Promise<LocalEntity> {
    const local = await this.buscarPorId(id);

    if (dados.nome !== undefined) {
      const nome = dados.nome.trim();

      const localExistente = await this.locaisRepository.findOne({
        where: { nome },
      });

      if (localExistente && localExistente.id !== id) {
        throw new ConflictException('Local já cadastrado');
      }

      local.nome = nome;
    }

    return this.locaisRepository.save(local);
  }

  async remover(id: number): Promise<void> {
    const local = await this.buscarPorId(id);

    await this.locaisRepository.remove(local);
  }
}