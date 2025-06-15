import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { EdgeService } from "./edge.service";
import { EdgeObject } from "./edge.object";

@Resolver(() => EdgeObject)
export class EdgeResolver {
  constructor(private readonly service: EdgeService) {}

  @Query(() => [EdgeObject])
  async getEdges() {
    const list = await this.service.findAll();
    return list.map((e) => new EdgeObject(e));
  }

  @Query(() => EdgeObject, { nullable: true })
  async getEdge(@Args("id") id: string) {
    const edge = await this.service.findOne(id);
    return edge ? new EdgeObject(edge) : null;
  }

  @Mutation(() => EdgeObject)
  async createEdge(
    @Args("node1_alias") node1_alias: string,
    @Args("node2_alias") node2_alias: string,
  ) {
    const created = await this.service.create({
      node1Alias: node1_alias,
      node2Alias: node2_alias,
    });
    return new EdgeObject(created);
  }
}
