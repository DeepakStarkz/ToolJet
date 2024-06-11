import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Item {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  quantity: string;

  @IsString()
  @IsNotEmpty()
  interval: string;

  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class UpdateSubscriptionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[];

  @IsNumber()
  prorationDate: number;

  @IsBoolean()
  includeChange: boolean;

  @IsNotEmpty()
  planForm: any;
}