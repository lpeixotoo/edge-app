import { Transport, RmqOptions } from "@nestjs/microservices";

export const EDGE_EVENTS_SERVICE = "EDGE_EVENTS_SERVICE";

export const rabbitMqOptions: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? ""],
    queue: process.env.RABBITMQ_QUEUE ?? "",
    queueOptions: {
      durable: false, // fine for dev; turn on in prod
    },
  },
};
