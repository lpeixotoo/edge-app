# Edge App

A NestJS-based GraphQL API for managing network edges with real-time event processing using RabbitMQ and PostgreSQL database integration.

## Features

- **GraphQL API** - Query and mutate edge data with type-safe operations
- **Event-Driven Architecture** - Real-time edge creation events via RabbitMQ
- **Database Integration** - PostgreSQL with Prisma ORM
- **Comprehensive Testing** - Unit tests for all services, resolvers, and handlers
- **Type Safety** - Full TypeScript implementation with strict typing

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd edge-app
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

The default configuration works with the Docker setup:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edge_app_db"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
RABBITMQ_QUEUE="edge_events"
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and RabbitMQ
docker-compose up -d

# Wait for services to be ready (~30 seconds)
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 5. Start Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:
- **GraphQL Playground**: http://localhost:3000/graphql
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## API Usage

### GraphQL Operations

#### Query All Edges
```graphql
query {
  getEdges {
    id
    capacity
    node1_alias
    node2_alias
    edge_peers
    created_at
    updated_at
  }
}
```

#### Query Single Edge
```graphql
query {
  getEdge(id: "your-edge-id") {
    id
    capacity
    node1_alias
    node2_alias
    edge_peers
  }
}
```

#### Create Edge
```graphql
mutation {
  createEdge(node1_alias: "alice", node2_alias: "bob") {
    id
    capacity
    node1_alias
    node2_alias
    edge_peers
    created_at
  }
}
```

### Event Flow

When an edge is created:
1. Edge record is saved to PostgreSQL
2. `edge.created` event is emitted to RabbitMQ
3. `EdgeEventsHandler` processes the event
4. Node aliases are automatically updated with `_updated` suffix
5. Creation is logged with detailed information

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Lint code
npm run format             # Format code

# Build
npm run build              # Build for production
```

### Project Structure

```
src/
├── edge/                  # Edge module
│   ├── edge.service.ts           # Business logic
│   ├── edge.resolver.ts          # GraphQL resolver
│   ├── edge.object.ts            # GraphQL object type
│   ├── edge.events.handler.ts    # Event handler
│   ├── edge.module.ts            # Module definition
│   └── *.spec.ts                 # Unit tests
├── rabbitmq/              # Message queue configuration
├── prisma.service.ts      # Database service
└── main.ts               # Application entry point
```

### Testing

Run the comprehensive test suite:

```bash
# All tests
npm test

# Specific test file
npm test edge.service.spec.ts

# Coverage report
npm run test:cov
```

## Docker Services

### PostgreSQL
- **Port**: 5432
- **Database**: edge_app_db
- **Credentials**: postgres/postgres

### RabbitMQ
- **AMQP Port**: 5672
- **Management UI**: 15672
- **Credentials**: guest/guest

## Monitoring

- **Database**: Access Prisma Studio at `npx prisma studio`
- **Message Queue**: RabbitMQ Management UI at http://localhost:15672
- **Logs**: Application logs show detailed edge creation and processing events

## Future Improvements

### Add Proper Validation for Mutations

Currently, the application accepts any string values for node aliases without validation. Future enhancements should include:

- **Input Validation**: Implement class-validator decorators for GraphQL input types
- **Business Rules**: Add validation for duplicate edges, alias format requirements
- **Schema Validation**: Ensure node aliases meet specific criteria (length, characters, etc.)
- **Custom Validators**: Create domain-specific validation rules for network topology

Example implementation:
```typescript
@InputType()
export class CreateEdgeInput {
  @IsString()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  node1_alias: string;

  @IsString()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  node2_alias: string;
}
```

### Add Better Error Handling

The current implementation has basic error propagation. Improvements needed:

- **Custom Exception Filters**: Create specific exception types for different error scenarios
- **Structured Error Responses**: Implement consistent error response format with error codes
- **Logging Enhancement**: Add structured logging with correlation IDs for request tracing
- **Graceful Degradation**: Handle service unavailability scenarios (database, RabbitMQ)
- **Retry Mechanisms**: Implement exponential backoff for transient failures
- **Circuit Breaker**: Add circuit breaker pattern for external service calls

Example implementation:
```typescript
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    // Handle specific Prisma errors with user-friendly messages
  }
}
```
## License

This project is licensed under the MIT license.
