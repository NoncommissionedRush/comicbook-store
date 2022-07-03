import { Res } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MockProvider } from "../../@types/common";
import { BooksService } from "../books/books.service";
import { ReservationItemDto } from "./dtos/reservation-item.dto";
import { ReservationDto } from "./dtos/reservation.dto";
import { ReservationItem } from "./entities/reservation-item.entity";
import { Reservation, ReservationStatus } from "./entities/reservation.entity";
import { ReservationsService } from "./reservations.service";

describe("ReservationsService", () => {
  let service: ReservationsService;
  let reservationRepository: MockProvider<Repository<Reservation>>;
  let reservationItemRepository: MockProvider<Repository<ReservationItem>>;
  let booksService: MockProvider<BooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Reservation)) {
          return {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn((item: { sessionId: string }) => ({
              id: 1,
              sessionId: item.sessionId,
              status: ReservationStatus.PENDING,
              note: null,
              items: [],
            })),
            save: jest.fn(),
          };
        }

        if (token === getRepositoryToken(ReservationItem)) {
          return {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn((item: ReservationItemDto) => ({
              id: 1,
              bookId: item.bookId,
              quantity: item.amount,
            })),
            save: jest.fn(),
          };
        }

        if (token === BooksService) {
          return {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          };
        }
      })
      .compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationRepository = module.get(getRepositoryToken(Reservation));
    reservationItemRepository = module.get(getRepositoryToken(ReservationItem));
    booksService = module.get(BooksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    let mockReservationDto: ReservationDto;
    let mockReservationItemDto: ReservationItemDto;

    beforeEach(async () => {
      jest.clearAllMocks();
      mockReservationItemDto = {
        bookId: 1,
        amount: 1,
      };
      mockReservationDto = {
        items: [mockReservationItemDto],
        note: "test note",
      };
      service.create("sessionId", mockReservationDto);
    });

    it("calls reservation repository create with session id", async () => {
      expect(reservationRepository.create).toHaveBeenCalledWith({
        sessionId: "sessionId",
      });
    });

    it("creates new reservation item for each object in items array", async () => {
      expect(reservationItemRepository.create).toHaveBeenCalledTimes(1);
      expect(reservationItemRepository.create).toHaveBeenCalledWith(
        mockReservationItemDto,
      );
    });

    it("calls reservation repository save", async () => {
      expect(reservationRepository.save).toHaveBeenCalledTimes(1);
      expect(reservationRepository.save).toHaveBeenCalledWith({
        id: 1,
        sessionId: "sessionId",
        status: ReservationStatus.PENDING,
        note: "test note",
        items: [{ id: 1, bookId: 1, quantity: 1 }],
      });
    });
  });

  describe("findAll", () => {
    it("calls reservation repository find", async () => {
      service.findAll();
      expect(reservationRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAllPending", () => {
    it("calls reservation repository find with status.pending condition", async () => {
      service.findAllPending();
      expect(reservationRepository.find).toHaveBeenCalledTimes(1);
      expect(reservationRepository.find).toHaveBeenCalledWith({
        relations: ["items"],
        where: { status: ReservationStatus.PENDING },
      });
    });
  });
});
