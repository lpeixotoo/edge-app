import { Module } from "@nestjs/common";
import { ClientProxyFactory } from "@nestjs/microservices";
import { rabbitMqOptions, EDGE_EVENTS_SERVICE } from "./rabbitmq.options";

@Module({
  providers: [
    {
      provide: EDGE_EVENTS_SERVICE,
      useFactory: () => ClientProxyFactory.create(rabbitMqOptions),
    },
  ],
  exports: [EDGE_EVENTS_SERVICE],
})
export class RabbitMqModule {}
