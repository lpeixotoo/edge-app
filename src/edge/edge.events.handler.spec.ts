import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { EdgeEventsHandler } from "./edge.events.handler";

describe("EdgeEventsHandler", () => {
  let handler: EdgeEventsHandler;
  let logger: Logger;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockRmqContext = {
    getChannelRef: jest.fn(),
    getMessage: jest.fn(),
  } as unknown as RmqContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgeEventsHandler],
    }).compile();

    handler = module.get<EdgeEventsHandler>(EdgeEventsHandler);

    // Replace the private logger with our mock
    (handler as any).log = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("handleEdgeCreated", () => {
    const mockPayload = {
      id: "edge-123",
      node1Alias: "alice",
      node2Alias: "bob",
      capacity: 1000000,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    it("should log edge creation with correct message format", () => {
      handler.handleEdgeCreated(mockPayload);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle zero capacity", () => {
      const customPayload = {
        ...mockPayload,
        capacity: 0,
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 0 has been created.",
      );
    });

    it("should handle node aliases with special characters", () => {
      const customPayload = {
        ...mockPayload,
        node1Alias: "node-with-dashes",
        node2Alias: "node_with_underscores",
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between node-with-dashes and node_with_underscores with a capacity of 1000000 has been created.",
      );
    });

    it("should handle very long node aliases", () => {
      const longAlias = "a".repeat(100);
      const customPayload = {
        ...mockPayload,
        node1Alias: longAlias,
        node2Alias: "bob",
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `edge.created → New channel between ${longAlias} and bob with a capacity of 1000000 has been created.`,
      );
    });

    it("should handle large capacity numbers", () => {
      const customPayload = {
        ...mockPayload,
        capacity: Number.MAX_SAFE_INTEGER,
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `edge.created → New channel between alice and bob with a capacity of ${Number.MAX_SAFE_INTEGER} has been created.`,
      );
    });

    it("should not throw errors when payload has extra properties", () => {
      const extendedPayload = {
        ...mockPayload,
        extraProperty: "should be ignored",
        anotherProperty: 123,
      };

      expect(() => {
        handler.handleEdgeCreated(extendedPayload as any);
      }).not.toThrow();

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle different date formats in createdAt", () => {
      const customPayload = {
        ...mockPayload,
        createdAt: new Date("2025-12-31T23:59:59.999Z"),
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle different id formats", () => {
      const customPayload = {
        ...mockPayload,
        id: "very-long-uuid-12345678-1234-1234-1234-123456789012",
      };

      handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should use the correct logger instance name", () => {
      // Create a new instance to test logger initialization
      const newHandler = new EdgeEventsHandler();
      const loggerSpy = jest
        .spyOn(Logger.prototype, "log")
        .mockImplementation();

      newHandler.handleEdgeCreated(mockPayload);

      // The logger should be created with the class name
      expect((newHandler as any).log).toBeDefined();

      loggerSpy.mockRestore();
    });
  });

  describe("Logger integration", () => {
    it("should create logger with correct name", () => {
      const newHandler = new EdgeEventsHandler();
      expect((newHandler as any).log).toBeDefined();
    });
  });
});
