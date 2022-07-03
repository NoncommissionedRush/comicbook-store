import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { AuthGuard } from "../users/guards/auth.guard";
import { ReservationDto } from "./dtos/reservation.dto";
import { ReservationsService } from "./reservations.service";

@Controller("reservations")
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(
    @Session() session: Record<string, any>,
    @Body() body: ReservationDto,
  ) {
    this.cacheManager.del("/reservations");
    this.cacheManager.del("/reservations/pending");
    return this.reservationsService.create(session.id, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.reservationsService.findAll();
  }

  @Get("/pending")
  @UseGuards(AuthGuard)
  async findAllPending() {
    return this.reservationsService.findAllPending();
  }

  @Get("/:id")
  @UseGuards(AuthGuard)
  async findOne(@Param("id") id: string) {
    return this.reservationsService.findOne(Number(id));
  }

  @Put("/:id")
  @UseGuards(AuthGuard)
  async process(@Param("id") id: string) {
    this.cacheManager.del("/reservations");
    this.cacheManager.del("/reservations/pending");
    return this.reservationsService.process(Number(id));
  }

  @Delete("/:id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    this.cacheManager.del("/reservations");
    this.cacheManager.del("/reservations/pending");
    return this.reservationsService.delete(Number(id));
  }
}
