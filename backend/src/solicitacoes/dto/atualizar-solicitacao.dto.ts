import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class AtualizarSolicitacaoDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @IsUUID()
  objetoId?: string;

  @IsOptional()
  @IsIn(['pendente', 'aprovada', 'recusada'])
  status?: 'pendente' | 'aprovada' | 'recusada';
}