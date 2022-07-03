import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MockProvider } from "../../@types/common";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let repo: MockProvider<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          };
        }
      })
      .compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("calls repo.find()", async () => {
      await service.findAll();

      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("calls repo.findOne with id", () => {
      service.findOne(1);
      expect(repo.findOne).toHaveBeenCalledWith(1);
    });

    it("calls repo.findOne with username", () => {
      service.findOne("username");
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { username: "username" },
      });
    });
  });

  describe("create", () => {
    it("should create a new user", () => {
      const user = { id: 1, username: "username", password: "password" };
      repo.create.mockReturnValue(user);
      service.create("username", "password");
      expect(repo.create).toHaveBeenCalledWith({
        username: "username",
        password: "password",
      });
      expect(repo.save).toHaveBeenCalledWith(user);
    });
  });

  describe("udpate", () => {
    it("should update an existing user", async () => {
      const user = { id: 1, username: "username", password: "password" };
      repo.findOne.mockReturnValue(user);
      await service.update(1, { username: "newUsername" });
      expect(repo.save).toHaveBeenCalledWith({
        ...user,
        username: "newUsername",
      });
    });
  });
});
