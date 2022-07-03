import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MockProvider } from "../../@types/common";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";

describe("AuthService", () => {
  let service: AuthService;
  let mockUsersService: MockProvider<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findOne: jest.fn(),
            create: jest.fn(),
          };
        }
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("calls usersService.create with username and hashed password", async () => {
      const username = "username";
      const password = "password";

      await service.register(username, password);

      expect(mockUsersService.create.mock.calls[0][0]).toBe(username);
      expect(mockUsersService.create.mock.calls[0][1]).not.toBe(password);
    });

    it("throws BadRequestException if user already exists", async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
        username: "username",
      });

      try {
        await service.register("username", "password");
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe("login", () => {
    const passwordString =
      "eeb9ce0873c539ab2996d9e073838064eeb53b15ed418853466be1d0ea50c9ff.9c9a976fd0361e08920b075c02543db965d26387ad372da7aa11e7e57db24f4f";

    it("throws UnauthorizedException if user does not exist", async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      try {
        await service.login("username", "password");
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });

    it("throws UnauthorizedException if password is incorrect", async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
        username: "username",
        password: passwordString,
      });

      try {
        await service.login("username", "wrong-password");
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });

    it("returns the user if credentials are correct ", async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
        username: "username",
        password: passwordString,
      });

      const user = await service.login("username", "password");

      expect(user).toEqual({
        id: 1,
        username: "username",
        password: passwordString,
      });
    });
  });
});
