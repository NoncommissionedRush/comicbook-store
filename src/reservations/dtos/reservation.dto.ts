import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { ReservationItemDto } from "./reservation-item.dto";

export class ReservationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];

  @IsString()
  @IsOptional()
  note?: string;
}
