import { IsIn, IsUUID } from 'class-validator';

export class CriarSolicitacaoDto {
  @IsUUID()
  usuarioId: string;

  @IsUUID()
  objetoId: string;

  @IsIn(['pendente', 'aprovada', 'recusada'])
  status: 'pendente' | 'aprovada' | 'recusada';
}