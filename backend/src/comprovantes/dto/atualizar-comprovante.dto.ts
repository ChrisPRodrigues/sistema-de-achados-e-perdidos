import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class AtualizarComprovanteDto {
  @IsOptional()
  @IsUUID()
  objetoId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  descricao?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataRegistro?: Date;
}