import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoriaEntity } from './entities/categoria.entity.js';
import { CriarCategoriaDto } from './dto/criar-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(CategoriaEntity)
    private readonly categoriasRepository: Repository<CategoriaEntity>,
  ) {}

  async criar(dados: CriarCategoriaDto): Promise<CategoriaEntity> {
    const nome = dados.nome.trim();

    const categoriaExistente = await this.categoriasRepository.findOne({
      where: { nome },
    });

    if (categoriaExistente) {
      throw new ConflictException('Categoria já cadastrada');
    }

    const novaCategoria = this.categoriasRepository.create({
      nome,
    });

    return this.categoriasRepository.save(novaCategoria);
  }

  async listar(): Promise<CategoriaEntity[]> {
    return this.categoriasRepository.find();
  }

  async buscarPorId(id: number): Promise<CategoriaEntity> {
    const categoria = await this.categoriasRepository.findOne({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return categoria;
  }
}