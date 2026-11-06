import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CriarObjetoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(150)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  descricao: string;

  @IsUUID()
  categoriaId: string;

  @IsUUID()
  localId: string;

  @IsUUID()
  usuarioId: string;

  @Type(() => Date)
  @IsDate()
  dataEncontrado: Date;
}