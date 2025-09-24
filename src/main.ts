import { ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/'
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('A comprehensive API for user management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);


}
bootstrap();