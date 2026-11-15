export class SolicitacaoRespostaDto {
  id: string;
  usuarioId: string;
  objetoId: string;
  status: 'pendente' | 'aprovada' | 'recusada';
}