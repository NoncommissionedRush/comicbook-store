import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsNumber()
  amount: number;
}
