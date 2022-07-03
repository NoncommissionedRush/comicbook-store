import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ReservationItem } from "./reservation-item.entity";

export enum ReservationStatus {
  PENDING = "pending",
  PROCESSED = "processed",
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({
    type: "enum",
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ nullable: true })
  note: string;

  @OneToMany(() => ReservationItem, (item) => item.reservation, {
    cascade: true,
  })
  items: ReservationItem[];
}
