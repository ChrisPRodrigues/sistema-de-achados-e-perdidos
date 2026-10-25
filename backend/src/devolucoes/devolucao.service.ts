
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DevolucaoEntity } from './entities/devolucao.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import type { Devolucao } from './devolucao.interface.js';

@Injectable()
export class DevolucaoService {
  constructor(
    @InjectRepository(DevolucaoEntity)
    private readonly devolucoes: Repository<DevolucaoEntity>,
    @InjectRepository(ObjetoEntity)
    private readonly objetos: Repository<ObjetoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarios: Repository<UsuarioEntity>,
  ) {}

  async listar(): Promise<Devolucao[]> {
    const registros = await this.devolucoes.find({
      relations: { objeto: true, usuario: true },
      order: { id: 'ASC' },
    });

    return registros.map((item) => this.converter(item));
  }

  async buscarPorId(id: number): Promise<Devolucao> {
    const registro = await this.devolucoes.findOne({
      where: { id },
      relations: { objeto: true, usuario: true },
    });

    if (!registro) {
      throw new NotFoundException('Devolução não encontrada');
    }

    return this.converter(registro);
  }

  async adicionar(
    dados: Omit<Devolucao, 'id' | 'dataDevolucao'>,
  ): Promise<Devolucao> {
    const objeto = await this.objetos.findOneBy({
      id: dados.objetoId,
    });

    if (!objeto) {
      throw new NotFoundException('Objeto não encontrado');
    }

    const usuario = await this.usuarios.findOneBy({
      id: dados.usuarioId,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const devolucaoExistente = await this.devolucoes.findOne({
      where: { objeto: { id: dados.objetoId } },
    });

    if (devolucaoExistente) {
      throw new ConflictException(
        'Este objeto já possui uma devolução registrada',
      );
    }

    const registro = this.devolucoes.create({
      objeto,
      usuario,
    });

    const salvo = await this.devolucoes.save(registro);

    return this.buscarPorId(salvo.id);
  }

  async atualizar(
    id: number,
    dados: Partial<Omit<Devolucao, 'id' | 'dataDevolucao'>>,
  ): Promise<Devolucao> {
    const registro = await this.devolucoes.findOne({
      where: { id },
      relations: { objeto: true, usuario: true },
    });

    if (!registro) {
      throw new NotFoundException('Devolução não encontrada');
    }

    if (dados.objetoId !== undefined) {
      const objeto = await this.objetos.findOneBy({
        id: dados.objetoId,
      });

      if (!objeto) {
        throw new NotFoundException('Objeto não encontrado');
      }

      const outraDevolucao = await this.devolucoes.findOne({
        where: { objeto: { id: dados.objetoId } },
      });

      if (outraDevolucao && outraDevolucao.id !== id) {
        throw new ConflictException(
          'Este objeto já possui uma devolução registrada',
        );
      }

      registro.objeto = objeto;
    }

    if (dados.usuarioId !== undefined) {
      const usuario = await this.usuarios.findOneBy({
        id: dados.usuarioId,
      });

      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      registro.usuario = usuario;
    }

    await this.devolucoes.save(registro);

    return this.buscarPorId(id);
  }

  async remover(id: number): Promise<void> {
    const resultado = await this.devolucoes.delete(id);

    if (!resultado.affected) {
      throw new NotFoundException('Devolução não encontrada');
    }
  }

  private converter(registro: DevolucaoEntity): Devolucao {
    return {
      id: registro.id,
      objetoId: registro.objeto.id,
      usuarioId: registro.usuario.id,
      dataDevolucao: registro.dataDevolucao,
    };
  }
}
