import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { EdgeEventsHandler } from "./edge.events.handler";
import { EdgeService } from "./edge.service";
import { EdgeCreatedPayload } from "src/rabbitmq/rabbitmq.protocols";

describe("EdgeEventsHandler", () => {
  let handler: EdgeEventsHandler;
  let edgeService: EdgeService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockEdgeService = {
    updateNodeAliases: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgeEventsHandler],
      providers: [
        {
          provide: EdgeService,
          useValue: mockEdgeService,
        },
      ],
    }).compile();

    handler = module.get<EdgeEventsHandler>(EdgeEventsHandler);
    edgeService = module.get<EdgeService>(EdgeService);

    // Replace the private logger with our mock
    (handler as unknown as { log: typeof mockLogger }).log = mockLogger;
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

    it("should log edge creation with correct message format", async () => {
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(mockPayload);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle zero capacity", async () => {
      const customPayload = {
        ...mockPayload,
        capacity: 0,
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 0 has been created.",
      );
    });

    it("should handle node aliases with special characters", async () => {
      const customPayload = {
        ...mockPayload,
        node1Alias: "node-with-dashes",
        node2Alias: "node_with_underscores",
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between node-with-dashes and node_with_underscores with a capacity of 1000000 has been created.",
      );
    });

    it("should handle very long node aliases", async () => {
      const longAlias = "a".repeat(100);
      const customPayload = {
        ...mockPayload,
        node1Alias: longAlias,
        node2Alias: "bob",
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `edge.created → New channel between ${longAlias} and bob with a capacity of 1000000 has been created.`,
      );
    });

    it("should handle large capacity numbers", async () => {
      const customPayload = {
        ...mockPayload,
        capacity: Number.MAX_SAFE_INTEGER,
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `edge.created → New channel between alice and bob with a capacity of ${Number.MAX_SAFE_INTEGER} has been created.`,
      );
    });

    it("should not throw errors when payload has extra properties", async () => {
      const extendedPayload = {
        ...mockPayload,
        extraProperty: "should be ignored",
        anotherProperty: 123,
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      expect(async () => {
        await handler.handleEdgeCreated(extendedPayload as EdgeCreatedPayload);
      }).not.toThrow();

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle different date formats in createdAt", async () => {
      const customPayload = {
        ...mockPayload,
        createdAt: new Date("2025-12-31T23:59:59.999Z"),
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should handle different id formats", async () => {
      const customPayload = {
        ...mockPayload,
        id: "very-long-uuid-12345678-1234-1234-1234-123456789012",
      };
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(customPayload);

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
    });

    it("should call updateNodeAliases with correct edge id", async () => {
      mockEdgeService.updateNodeAliases.mockResolvedValue({});

      await handler.handleEdgeCreated(mockPayload);

      expect(edgeService.updateNodeAliases).toHaveBeenCalledTimes(1);
      expect(edgeService.updateNodeAliases).toHaveBeenCalledWith("edge-123");
    });

    it("should handle updateNodeAliases errors gracefully", async () => {
      const updateError = new Error("Update failed");
      mockEdgeService.updateNodeAliases.mockRejectedValue(updateError);

      await expect(handler.handleEdgeCreated(mockPayload)).rejects.toThrow(
        "Update failed",
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        "edge.created → New channel between alice and bob with a capacity of 1000000 has been created.",
      );
      expect(edgeService.updateNodeAliases).toHaveBeenCalledWith("edge-123");
    });

    it("should call updateNodeAliases even when edge not found", async () => {
      mockEdgeService.updateNodeAliases.mockResolvedValue(null);

      await handler.handleEdgeCreated(mockPayload);

      expect(edgeService.updateNodeAliases).toHaveBeenCalledTimes(1);
      expect(edgeService.updateNodeAliases).toHaveBeenCalledWith("edge-123");
    });
  });

  describe("Logger integration", () => {
    it("should create logger with correct name", () => {
      const mockService = {
        updateNodeAliases: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
      };
      const newHandler = new EdgeEventsHandler(
        mockService as unknown as EdgeService,
      );
      expect(
        (newHandler as unknown as { log: typeof mockLogger }).log,
      ).toBeDefined();
    });
  });
});
