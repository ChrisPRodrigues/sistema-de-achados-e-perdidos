import {
  IsUUID,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegistrarDevolucaoDto {
  @IsUUID()
  usuarioId: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'A observação não pode conter apenas espaços',
  })
  @MaxLength(500)
  observacao?: string;
}