import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

@Injectable()
export class EdgeService {
  constructor(private prisma: PrismaService) {}

  /** List all edges */
  findAll() {
    return this.prisma.edge.findMany();
  }

  /**
   * Create Edge entity
   * @param {Prisma.EdgeCreateInput} data - Edge Input data (node1_alias, node2_alias)
   */
  create(data: Prisma.EdgeCreateInput) {
    return this.prisma.edge.create({ data });
  }

  /**
   * Find Edge entity by id
   * @param {string} id - Edge id
   */
  findOne(id: string) {
    return this.prisma.edge.findUnique({ where: { id } });
  }
}
