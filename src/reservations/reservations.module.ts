import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksModule } from "../books/books.module";
import { ReservationItem } from "./entities/reservation-item.entity";
import { Reservation } from "./entities/reservation.entity";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationItem]),
    BooksModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
