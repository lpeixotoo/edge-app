import { Test, TestingModule } from "@nestjs/testing";
import { EdgeService } from "./edge.service";
import { PrismaService } from "../prisma.service";
import { Prisma } from "@prisma/client";
import { EDGE_EVENTS_SERVICE } from "../rabbitmq/rabbitmq.options";

describe("EdgeService", () => {
  let service: EdgeService;
  let prismaService: PrismaService;

  const mockEdge = {
    id: "1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    capacity: 1000000,
    node1Alias: "alice",
    node2Alias: "bob",
  };

  const mockPrismaService = {
    edge: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEdgeEventsService = {
    emit: jest.fn().mockReturnValue({
      subscribe: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EDGE_EVENTS_SERVICE,
          useValue: mockEdgeEventsService,
        },
      ],
    }).compile();

    service = module.get<EdgeService>(EdgeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of edges", async () => {
      const mockEdges = [mockEdge];
      mockPrismaService.edge.findMany.mockResolvedValue(mockEdges);

      const result = await service.findAll();

      expect(result).toEqual(mockEdges);
      expect(prismaService.edge.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.edge.findMany).toHaveBeenCalledWith();
    });

    it("should return empty array when no edges exist", async () => {
      mockPrismaService.edge.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prismaService.edge.findMany).toHaveBeenCalledTimes(1);
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database connection failed");
      mockPrismaService.edge.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(
        "Database connection failed",
      );
      expect(prismaService.edge.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    const createData: Prisma.EdgeCreateInput = {
      node1Alias: "alice",
      node2Alias: "bob",
    };

    it("should create and return a new edge", async () => {
      mockPrismaService.edge.create.mockResolvedValue(mockEdge);

      const result = await service.create(createData);

      expect(result).toEqual(mockEdge);
      expect(prismaService.edge.create).toHaveBeenCalledTimes(1);
      expect(prismaService.edge.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it("should emit edge.created event after creating edge", async () => {
      mockPrismaService.edge.create.mockResolvedValue(mockEdge);

      const result = await service.create(createData);

      expect(result).toEqual(mockEdge);
      expect(mockEdgeEventsService.emit).toHaveBeenCalledTimes(1);
      expect(mockEdgeEventsService.emit).toHaveBeenCalledWith("edge.created", {
        id: mockEdge.id,
        node1Alias: mockEdge.node1Alias,
        node2Alias: mockEdge.node2Alias,
        capacity: mockEdge.capacity,
        createdAt: mockEdge.createdAt,
      });
    });

    it("should handle validation errors", async () => {
      const validationError = new Error("Validation failed");
      mockPrismaService.edge.create.mockRejectedValue(validationError);

      await expect(service.create(createData)).rejects.toThrow(
        "Validation failed",
      );
      expect(prismaService.edge.create).toHaveBeenCalledTimes(1);
      expect(prismaService.edge.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe("findOne", () => {
    const edgeId = "1";

    it("should return an edge when found", async () => {
      mockPrismaService.edge.findUnique.mockResolvedValue(mockEdge);

      const result = await service.findOne(edgeId);

      expect(result).toEqual(mockEdge);
      expect(prismaService.edge.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.edge.findUnique).toHaveBeenCalledWith({
        where: { id: edgeId },
      });
    });

    it("should return null when edge not found", async () => {
      mockPrismaService.edge.findUnique.mockResolvedValue(null);

      const result = await service.findOne("non-existent-id");

      expect(result).toBeNull();
      expect(prismaService.edge.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.edge.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      });
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database error");
      mockPrismaService.edge.findUnique.mockRejectedValue(dbError);

      await expect(service.findOne(edgeId)).rejects.toThrow("Database error");
      expect(prismaService.edge.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
