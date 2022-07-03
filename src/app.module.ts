import { CacheModule, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import session from "express-session";
import { dbConfig, s3Config, sessionConfig } from "../config/configuration";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BooksModule } from "./books/books.module";
import { CartModule } from "./cart/cart.module";
import { CustomCacheInterceptor } from "./interceptors/custom-cache.interceptor";
import { ReservationsModule } from "./reservations/reservations.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, sessionConfig, s3Config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => config.get("database"),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 86400,
    }),
    UsersModule,
    BooksModule,
    ReservationsModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          cookie: {
            maxAge: 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax",
            secure: false,
          },
          secret: this.configService.get("session.secret"),
          resave: true,
          saveUninitialized: true,
        }),
      )
      .forRoutes("*");
  }
}
