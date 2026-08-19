import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListAvailableOrdersQueryDto {
  @ApiPropertyOptional({
    example: 'Актау',
    description: 'Фильтр по точке отправки',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin?: string;

  @ApiPropertyOptional({
    example: 'Жанаозен',
    description: 'Фильтр по точке назначения',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  destination?: string;

  @ApiPropertyOptional({ example: '1000', description: 'Минимальный вес, кг' })
  @IsOptional()
  @IsString()
  weightMin?: string;

  @ApiPropertyOptional({ example: '5000', description: 'Максимальный вес, кг' })
  @IsOptional()
  @IsString()
  weightMax?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'weight'],
    description: 'Поле сортировки',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Направление сортировки',
  })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Максимум записей (1..500)',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
