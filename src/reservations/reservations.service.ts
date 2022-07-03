import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksService } from "../books/books.service";
import { ReservationItemDto } from "./dtos/reservation-item.dto";
import { ReservationDto } from "./dtos/reservation.dto";
import { ReservationItem } from "./entities/reservation-item.entity";
import { Reservation, ReservationStatus } from "./entities/reservation.entity";

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReservationItem)
    private readonly reservationItemRepository: Repository<ReservationItem>,
    private readonly booksService: BooksService,
  ) {}

  async create(sessionId: string, body: ReservationDto): Promise<Reservation> {
    const reservation = this.reservationRepository.create({ sessionId });

    if (body.note) {
      reservation.note = body.note;
    }

    reservation.items = await this.parseReservationItems(body.items);

    return await this.reservationRepository.save(reservation);
  }

  private async parseReservationItems(
    items: ReservationItemDto[],
  ): Promise<ReservationItem[]> {
    const reservationItems: ReservationItem[] = [];

    for (const item of items) {
      const newItem = this.reservationItemRepository.create({
        amount: item.amount,
      });
      const book = await this.booksService.findOne(item.bookId);
      newItem.book = book;
      reservationItems.push(newItem);
    }

    return reservationItems;
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: ["items", "items.book"],
    });
  }

  findAllPending(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: ["items"],
      where: { status: ReservationStatus.PENDING },
    });
  }

  findOne(id: number): Promise<Reservation>;
  findOne(sessionId: string): Promise<Reservation>;
  findOne(param: string | number): Promise<Reservation> {
    if (typeof param === "number") {
      return this.reservationRepository.findOne(param, {
        relations: ["items", "items.book"],
      });
    }

    return this.reservationRepository.findOne({
      relations: ["items", "items.book"],
      where: { sessionId: param },
    });
  }

  async process(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne(id, {
      relations: ["items"],
    });

    if (!reservation) {
      throw new NotFoundException();
    }

    for (const item of reservation.items) {
      if (item.book.amount < item.amount) {
        throw new BadRequestException("Not enough items in the inventory");
      }

      await this.booksService.update(item.book.id, { amount: item.amount });
    }

    reservation.status = ReservationStatus.PROCESSED;
    return await this.reservationRepository.save(reservation);
  }

  async delete(id: number): Promise<void> {
    await this.reservationRepository.delete(id);
  }
}
