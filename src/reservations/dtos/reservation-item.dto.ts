import { IsNumber } from "class-validator";

export class ReservationItemDto {
  @IsNumber()
  bookId: number;
  @IsNumber()
  amount: number;
}
