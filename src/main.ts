import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { rabbitMqOptions } from "./rabbitmq/rabbitmq.options";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(rabbitMqOptions);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
