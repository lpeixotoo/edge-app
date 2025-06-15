import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { EdgeModule } from "./edge/edge.module";
import { PrismaModule } from "./prisma.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "schema.gql",
      graphiql: true,
    }),
    PrismaModule,
    EdgeModule,
  ],
})
export class AppModule {}
