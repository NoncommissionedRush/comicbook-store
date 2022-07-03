import { registerAs } from "@nestjs/config";
import { Book } from "../src/books/entities/book.entity";
import { Tag } from "../src/books/entities/tag.entity";
import { ReservationItem } from "../src/reservations/entities/reservation-item.entity";
import { Reservation } from "../src/reservations/entities/reservation.entity";
import { User } from "../src/users/user.entity";

export const dbConfig = registerAs("database", () => {
  let dbName: string;

  switch (process.env.NODE_ENV) {
    case "dev":
      dbName = process.env.DB_NAME_DEV;
      break;
    case "test":
      dbName = process.env.DB_NAME_TEST;
      break;
    case "prod":
      dbName = process.env.DB_NAME;
      break;
    default:
      dbName = process.env.DB_NAME;
  }
  return {
    type: "postgres",
    database: dbName,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [User, Book, Tag, Reservation, ReservationItem],
    synchronize:
      process.env.NODE_ENV === "dev" || process.env.NODE_ENV == "test",
    autoLoadEntities: true,
    keepConnectionAlive: true,
  };
});

export const sessionConfig = registerAs("session", () => ({
  secret: process.env.SESSION_SECRET,
}));

export const s3Config = registerAs("s3", () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.AWS_BUCKET,
}));
