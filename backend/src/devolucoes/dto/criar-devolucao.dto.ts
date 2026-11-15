import { IsUUID } from 'class-validator';
import { RegistrarDevolucaoDto } from './registrar-devolucao.dto.js';

export class CriarDevolucaoDto extends RegistrarDevolucaoDto {
  @IsUUID()
  objetoId: string;
}