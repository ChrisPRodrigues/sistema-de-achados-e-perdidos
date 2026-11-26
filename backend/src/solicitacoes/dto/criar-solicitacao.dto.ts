import { IsUUID } from 'class-validator';

export class CriarSolicitacaoDto {
  @IsUUID()
  objetoId: string;
}