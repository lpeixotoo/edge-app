import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { ClientProxy } from "@nestjs/microservices";
import { EDGE_EVENTS_SERVICE } from "../rabbitmq/rabbitmq.options";

@Injectable()
export class EdgeService {
  constructor(
    private prisma: PrismaService,
    @Inject(EDGE_EVENTS_SERVICE) private readonly mq: ClientProxy,
  ) {}

  /** List all edges */
  findAll() {
    return this.prisma.edge.findMany();
  }

  /**
   * Create Edge entity
   * @param {Prisma.EdgeCreateInput} data - Edge Input data (node1_alias, node2_alias)
   */
  async create(data: Prisma.EdgeCreateInput) {
    const edge = await this.prisma.edge.create({ data }); // fire-and-forget; we log but don’t await for perf

    this.mq
      .emit("edge.created", {
        id: edge.id,
        node1Alias: edge.node1Alias,
        node2Alias: edge.node2Alias,
        capacity: edge.capacity,
        createdAt: edge.createdAt,
      })
      .subscribe();

    return edge;
  }

  /**
   * Find Edge entity by id
   * @param {string} id - Edge id
   */
  findOne(id: string) {
    return this.prisma.edge.findUnique({ where: { id } });
  }
}
