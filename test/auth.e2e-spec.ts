import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { getConnection } from "typeorm";

describe("Auth routes (e2e)", () => {
  let app: INestApplication;
  const mockUsername = "testUsername";
  const mockPassword = "testPassword";
  let response: request.Response;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    response = await request(app.getHttpServer())
      .post("/users/auth/register")
      .send({ username: mockUsername, password: mockPassword });
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.delete({});
    }
    const connection = getConnection();
    await connection.close();
  });

  describe("register", () => {
    it("should return 201", () => {
      expect(response.status).toBe(201);
    });

    it("should return the created user", () => {
      expect(response.body.id).toBeDefined();
      expect(response.body.username).toBe(mockUsername);
    });

    it("returns the cookie with userId", async () => {
      const cookie = response.get("Set-Cookie");
      const { body } = await request(app.getHttpServer())
        .get("/users/me")
        .set("Cookie", cookie);
      expect(body.id).toBeDefined();
    });

    it("returns 400 bad request when user already exists", async () => {
      const { body } = await request(app.getHttpServer())
        .post("/users/auth/register")
        .send({ username: mockUsername, password: mockPassword })
        .expect(400);

      expect(body.error).toBeDefined();
    });
  });

  describe("login", () => {
    it("should return 201", async () => {
      await request(app.getHttpServer())
        .post("/users/auth/login")
        .send({ username: mockUsername, password: mockPassword })
        .expect(201);
    });

    it("should return the user", async () => {
      const { body } = await request(app.getHttpServer())
        .post("/users/auth/login")
        .send({ username: mockUsername, password: mockPassword })
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.username).toBe(mockUsername);
    });

    it("returns cookie with userId", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/users/auth/login")
        .send({ username: mockUsername, password: mockPassword });
      const cookie = loginResponse.get("Set-Cookie");
      const { body } = await request(app.getHttpServer())
        .get("/users/me")
        .set("Cookie", cookie);
      expect(body.id).toBeDefined();
    });

    it("returns 401 unauthorized when user does not exist", async () => {
      await request(app.getHttpServer())
        .post("/users/auth/login")
        .send({ username: "wrongUsername", password: mockPassword })
        .expect(401);
    });

    it("returns 401 unauthorized when password is wrong", async () => {
      await request(app.getHttpServer())
        .post("/users/auth/login")
        .send({ username: mockUsername, password: "wrongPassword" })
        .expect(401);
    });
  });
});
