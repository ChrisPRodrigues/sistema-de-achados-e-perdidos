import { Injectable } from '@nestjs/common';
import { ObjetosRepositoryService } from '../objetos-repository/objetos-repository.service.js';
import type { Objeto } from '../models/objeto/objeto.interface.js';

@Injectable()
export class CadastroService {
  constructor(private readonly objetosRepository: ObjetosRepositoryService) {}

  cadastrar(dados: Omit<Objeto, 'id' | 'status'>): Objeto {
    return this.objetosRepository.adicionar({
      ...dados,
      status: 'encontrado',
    });
  }
}
