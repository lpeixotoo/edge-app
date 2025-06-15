import { Test, TestingModule } from "@nestjs/testing";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";

describe("AppResolver", () => {
  let resolver: AppResolver;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppResolver, AppService],
    }).compile();

    resolver = module.get<AppResolver>(AppResolver);
    service = module.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getHello", () => {
    it("should return 'Hello World!'", () => {
      jest.spyOn(service, "getHello").mockImplementation(() => "Hello World!");
      expect(resolver.getHello()).toBe("Hello World!");
    });
  });
});
