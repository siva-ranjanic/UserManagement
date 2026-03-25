import { IsArray, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkOperationUserDto {
  @ApiProperty({ example: ['id1', 'id2'], description: 'List of User IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  ids: string[];
}

export class BulkStatusUpdateDto extends BulkOperationUserDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
