import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Unique role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: ['id1', 'id2'], description: 'List of permission IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
