import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const port = 3000;
  await app.listen(port);

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}
bootstrap();
