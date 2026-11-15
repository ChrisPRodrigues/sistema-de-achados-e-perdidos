import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CriarComprovanteDto {
  @IsUUID()
  objetoId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  descricao: string;

  @Type(() => Date)
  @IsDate()
  dataRegistro: Date;
}