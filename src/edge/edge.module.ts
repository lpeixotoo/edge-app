import { Module } from "@nestjs/common";
import { EdgeResolver } from "./edge.resolver";
import { EdgeService } from "./edge.service";
import { PrismaModule } from "../prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [EdgeService, EdgeResolver],
})
export class EdgeModule {}
