import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload, Ctx, RmqContext } from "@nestjs/microservices";

interface EdgeCreatedPayload {
  id: string;
  node1Alias: string;
  node2Alias: string;
  capacity: number;
  createdAt: Date;
}

@Controller()
export class EdgeEventsHandler {
  private readonly log = new Logger(EdgeEventsHandler.name);

  @EventPattern("edge.created")
  handleEdgeCreated(@Payload() payload: EdgeCreatedPayload) {
    this.log.log(
      `edge.created → New channel between ${payload.node1Alias} and ${payload.node2Alias} with a capacity of ${payload.capacity} has been created.`,
    );
  }
}
