import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjetosRepositoryService } from '../objetos-repository/objetos-repository.service.js';
import { CategoriasService } from '../../categorias/categorias.service.js';
import type { Objeto } from '../models/objeto/objeto.interface.js';

@Injectable()
export class CadastroService {
  constructor(
    private readonly objetosRepository: ObjetosRepositoryService,
    private readonly categoriasService: CategoriasService
  ) {}

  cadastrar(dados: Omit<Objeto, 'id' | 'status'>): Objeto {
    const categoria = this.categoriasService.buscarPorId(dados.categoriaId);

    if (!categoria) {
      throw new BadRequestException('Categoria não encontrada');
    }

    return this.objetosRepository.adicionar({
      ...dados,
      status: 'encontrado',
    });
  }
  buscarPorId(id: number): Objeto {
  const objeto = this.objetosRepository.buscarPorId(id);

  if (!objeto) {
    throw new NotFoundException('Objeto não encontrado');
  }
  return objeto;
 }
}
