import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MockProvider } from "../../@types/common";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let mockUsersService: MockProvider<UsersService>;
  let mockAuthService: MockProvider<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          };
        }

        if (token === AuthService) {
          return {
            register: jest.fn(),
            login: jest.fn(),
          };
        }
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    mockUsersService = module.get(UsersService);
    mockAuthService = module.get(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const users = [{ id: 1, username: "test" }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
    });
  });

  describe("me", () => {
    it("throws NotFoundException if there is no userId on session object", async () => {
      const session = {};
      try {
        await controller.me(session);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it("calls usersService.findOne if there is a userId on sessino object", async () => {
      const session = { userId: 1 };
      mockUsersService.findOne.mockReturnValue({ id: 1, username: "test" });
      await controller.me(session);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });

    it("throws not found exception if user is not found", async () => {
      const session = { userId: 1 };
      mockUsersService.findOne.mockReturnValue(null);
      try {
        await controller.me(session);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it("returns found user", async () => {
      const session = { userId: 1 };
      mockUsersService.findOne.mockReturnValue({ id: 1, username: "test" });
      const result = await controller.me(session);
      expect(result).toEqual({ id: 1, username: "test" });
    });
  });

  describe("register", () => {
    const body = { username: "username", password: "password" };
    const session: { userId?: number } = {};
    const user = { id: 1, username: "test" };
    let result: User;
    beforeEach(async () => {
      mockAuthService.register.mockResolvedValue(user);
      result = await controller.register(body, session);
    });

    it("calls authService.register with username and password", async () => {
      expect(mockAuthService.register.mock.calls[0][0]).toEqual(body.username);
      expect(mockAuthService.register.mock.calls[0][1]).toEqual(body.password);
    });

    it("sets userId property on session object", () => {
      expect(session.userId).toEqual(user.id);
    });

    it("returns the user", () => {
      expect(result).toEqual(user);
    });
  });

  describe("login", () => {
    const body = { username: "username", password: "password" };
    const session: { userId?: number } = {};
    const user = { id: 1, username: "test" };
    let result: User;
    beforeEach(async () => {
      mockAuthService.login.mockResolvedValue(user);
      result = await controller.login(body, session);
    });

    it("calls authService.login with username and password", async () => {
      expect(mockAuthService.login.mock.calls[0][0]).toEqual(body.username);
      expect(mockAuthService.login.mock.calls[0][1]).toEqual(body.password);
    });

    it("sets userId property on session object", () => {
      expect(session.userId).toEqual(user.id);
    });

    it("returns the user", () => {
      expect(result).toEqual(user);
    });
  });
});
