// src/edge/edge.type.ts   ← or whatever suffix you prefer
import { ObjectType, Field, ID } from "@nestjs/graphql";
import { Edge as EdgeEntity } from "@prisma/client";

@ObjectType("EdgeObject")
export class EdgeObject {
  constructor(e: EdgeEntity) {
    Object.assign(this, e); // copy raw DB columns
  }

  // keep the decorated property – one declaration is enough
  @Field(() => ID)
  id!: string;

  createdAt!: Date;
  updatedAt!: Date;
  @Field(() => String)
  capacity!: number;
  node1Alias!: string;
  node2Alias!: string;

  /* ---- GraphQL-facing fields (snake_case & computed) ------------------ */

  @Field({ name: "created_at" })
  get created_at(): string {
    return this.createdAt.toISOString();
  }

  @Field({ name: "updated_at" })
  get updated_at(): string {
    return this.updatedAt.toISOString();
  }

  @Field({ name: "node1_alias" })
  get node1_alias(): string {
    return this.node1Alias;
  }

  @Field({ name: "node2_alias" })
  get node2_alias(): string {
    return this.node2Alias;
  }

  @Field({ name: "edge_peers" })
  get edge_peers(): string {
    return `${this.node1Alias}-${this.node2Alias}`;
  }
}
