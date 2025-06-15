import { Module } from "@nestjs/common";
import { EdgeResolver } from "./edge.resolver";
import { EdgeService } from "./edge.service";
import { PrismaModule } from "../prisma.module";
import { RabbitMqModule } from "src/rabbitmq/rabbitmq.module";
import { EdgeEventsHandler } from "./edge.events.handler";

@Module({
  imports: [PrismaModule, RabbitMqModule],
  controllers: [EdgeEventsHandler],
  providers: [EdgeService, EdgeResolver],
})
export class EdgeModule {}
