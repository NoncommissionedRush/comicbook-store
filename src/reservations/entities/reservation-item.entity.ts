import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "../../books/entities/book.entity";
import { Reservation } from "./reservation.entity";

@Entity()
export class ReservationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Book, { onDelete: "CASCADE" })
  book: Book;

  @Column()
  amount: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.items, {
    onDelete: "CASCADE",
  })
  reservation: Reservation;
}
