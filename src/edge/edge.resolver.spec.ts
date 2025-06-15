import { Test, TestingModule } from "@nestjs/testing";
import { EdgeResolver } from "./edge.resolver";
import { EdgeService } from "./edge.service";
import { EdgeObject } from "./edge.object";

describe("EdgeResolver", () => {
  let resolver: EdgeResolver;
  let edgeService: EdgeService;

  const mockEdgeEntity = {
    id: "1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    capacity: 1000000,
    node1Alias: "alice",
    node2Alias: "bob",
  };

  const mockEdgeService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgeResolver,
        {
          provide: EdgeService,
          useValue: mockEdgeService,
        },
      ],
    }).compile();

    resolver = module.get<EdgeResolver>(EdgeResolver);
    edgeService = module.get<EdgeService>(EdgeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getEdges", () => {
    it("should return an array of EdgeObjects", async () => {
      const mockEdges = [mockEdgeEntity];
      mockEdgeService.findAll.mockResolvedValue(mockEdges);

      const result = await resolver.getEdges();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(EdgeObject);
      expect(result[0].id).toBe("1");
      expect(result[0].node1Alias).toBe("alice");
      expect(result[0].node2Alias).toBe("bob");
      expect(result[0].edge_peers).toBe("alice-bob");
      expect(result[0].capacity).toBe(1000000);
      expect(edgeService.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no edges exist", async () => {
      mockEdgeService.findAll.mockResolvedValue([]);

      const result = await resolver.getEdges();

      expect(result).toEqual([]);
      expect(edgeService.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple edges", async () => {
      const mockEdges = [
        mockEdgeEntity,
        {
          ...mockEdgeEntity,
          id: "2",
          node1Alias: "charlie",
          node2Alias: "dave",
        },
      ];
      mockEdgeService.findAll.mockResolvedValue(mockEdges);

      const result = await resolver.getEdges();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EdgeObject);
      expect(result[1]).toBeInstanceOf(EdgeObject);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      expect(result[0].node1Alias).toBe("alice");
      expect(result[1].node1Alias).toBe("charlie");
      expect(result[0].edge_peers).toBe("alice-bob");
      expect(result[1].edge_peers).toBe("charlie-dave");
    });

    it("should handle service errors", async () => {
      const serviceError = new Error("Service unavailable");
      mockEdgeService.findAll.mockRejectedValue(serviceError);

      await expect(resolver.getEdges()).rejects.toThrow("Service unavailable");
      expect(edgeService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getEdge", () => {
    const edgeId = "1";

    it("should return an EdgeObject when edge is found", async () => {
      mockEdgeService.findOne.mockResolvedValue(mockEdgeEntity);

      const result = await resolver.getEdge(edgeId);

      expect(result).toBeInstanceOf(EdgeObject);
      expect(result).not.toBeNull();
      expect(result?.id).toBe("1");
      expect(result?.node1Alias).toBe("alice");
      expect(result?.node2Alias).toBe("bob");
      expect(result?.capacity).toBe(1000000);
      expect(result?.edge_peers).toBe("alice-bob");
      expect(edgeService.findOne).toHaveBeenCalledTimes(1);
      expect(edgeService.findOne).toHaveBeenCalledWith(edgeId);
    });

    it("should return null when edge is not found", async () => {
      mockEdgeService.findOne.mockResolvedValue(null);

      const result = await resolver.getEdge("non-existent-id");

      expect(result).toBeNull();
      expect(edgeService.findOne).toHaveBeenCalledTimes(1);
      expect(edgeService.findOne).toHaveBeenCalledWith("non-existent-id");
    });

    it("should handle different edge entities", async () => {
      const customEdge = {
        ...mockEdgeEntity,
        id: "2",
        node1Alias: "charlie",
        node2Alias: "dave",
        capacity: 2000000,
      };
      mockEdgeService.findOne.mockResolvedValue(customEdge);

      const result = await resolver.getEdge("2");

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(EdgeObject);
      expect(result?.id).toBe("2");
      expect(result?.node1Alias).toBe("charlie");
      expect(result?.node2Alias).toBe("dave");
      expect(result?.capacity).toBe(2000000);
      expect(result?.edge_peers).toBe("charlie-dave");
      expect(edgeService.findOne).toHaveBeenCalledWith("2");
    });

    it("should handle service errors", async () => {
      const serviceError = new Error("Database error");
      mockEdgeService.findOne.mockRejectedValue(serviceError);

      await expect(resolver.getEdge(edgeId)).rejects.toThrow("Database error");
      expect(edgeService.findOne).toHaveBeenCalledTimes(1);
      expect(edgeService.findOne).toHaveBeenCalledWith(edgeId);
    });

    it("should handle empty string id", async () => {
      mockEdgeService.findOne.mockResolvedValue(null);

      const result = await resolver.getEdge("");

      expect(result).toBeNull();
      expect(edgeService.findOne).toHaveBeenCalledWith("");
    });
  });

  describe("createEdge", () => {
    const node1_alias = "alice";
    const node2_alias = "bob";

    it("should create and return an EdgeObject", async () => {
      mockEdgeService.create.mockResolvedValue(mockEdgeEntity);

      const result = await resolver.createEdge(node1_alias, node2_alias);

      expect(result).toBeInstanceOf(EdgeObject);
      expect(result.id).toBe("1");
      expect(result.node1Alias).toBe("alice");
      expect(result.node2Alias).toBe("bob");
      expect(result.edge_peers).toBe("alice-bob");
      expect(result.capacity).toBe(1000000);
      expect(edgeService.create).toHaveBeenCalledTimes(1);
      expect(edgeService.create).toHaveBeenCalledWith({
        node1Alias: node1_alias,
        node2Alias: node2_alias,
      });
    });

    it("should handle different node aliases", async () => {
      const customEdge = {
        ...mockEdgeEntity,
        id: "2",
        node1Alias: "charlie",
        node2Alias: "dave",
      };
      mockEdgeService.create.mockResolvedValue(customEdge);

      const result = await resolver.createEdge("charlie", "dave");

      expect(result).toBeInstanceOf(EdgeObject);
      expect(result.id).toBe("2");
      expect(result.node1Alias).toBe("charlie");
      expect(result.node2Alias).toBe("dave");
      expect(result.edge_peers).toBe("charlie-dave");
      expect(edgeService.create).toHaveBeenCalledWith({
        node1Alias: "charlie",
        node2Alias: "dave",
      });
    });

    it("should handle empty string arguments", async () => {
      mockEdgeService.create.mockResolvedValue(mockEdgeEntity);

      const result = await resolver.createEdge("", "");

      expect(result).toBeInstanceOf(EdgeObject);
      expect(edgeService.create).toHaveBeenCalledWith({
        node1Alias: "",
        node2Alias: "",
      });
    });

    it("should handle service creation errors", async () => {
      const creationError = new Error("Failed to create edge");
      mockEdgeService.create.mockRejectedValue(creationError);

      await expect(
        resolver.createEdge(node1_alias, node2_alias),
      ).rejects.toThrow("Failed to create edge");
      expect(edgeService.create).toHaveBeenCalledTimes(1);
      expect(edgeService.create).toHaveBeenCalledWith({
        node1Alias: node1_alias,
        node2Alias: node2_alias,
      });
    });

    it("should handle validation errors from service", async () => {
      const validationError = new Error("Invalid node aliases");
      mockEdgeService.create.mockRejectedValue(validationError);

      await expect(
        resolver.createEdge(node1_alias, node2_alias),
      ).rejects.toThrow("Invalid node aliases");
    });
  });
});
