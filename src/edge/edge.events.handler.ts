import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { EdgeService } from "./edge.service";
import { EdgeCreatedPayload } from "src/rabbitmq/rabbitmq.protocols";

@Controller()
export class EdgeEventsHandler {
  private readonly log = new Logger(EdgeEventsHandler.name);

  constructor(private readonly edgeService: EdgeService) {}

  @EventPattern("edge.created")
  async handleEdgeCreated(@Payload() payload: EdgeCreatedPayload) {
    this.log.log(
      `edge.created → New channel between ${payload.node1Alias} and ${payload.node2Alias} with a capacity of ${payload.capacity} has been created.`,
    );

    // Update node aliases by appending "_updated"
    await this.edgeService.updateNodeAliases(payload.id);
  }
}
