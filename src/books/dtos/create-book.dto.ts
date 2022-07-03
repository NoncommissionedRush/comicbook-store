import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBookDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  price: number;

  @IsString()
  imageUrl: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
}
