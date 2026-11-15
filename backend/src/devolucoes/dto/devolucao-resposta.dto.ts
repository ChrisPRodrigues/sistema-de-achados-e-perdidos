export class DevolucaoRespostaDto {
  id: string;
  objetoId: string;
  usuarioId: string;
  dataDevolucao: Date;
  observacao?: string | null;
}