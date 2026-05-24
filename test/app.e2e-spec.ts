import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.FLAG = 'N4U{test-real-flag}';
    process.env.ADMIN_PASSWORD = 'test-admin-password';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/login (POST) accepts normal guest credentials', () => {
    return request(app.getHttpServer())
      .post('/api/login')
      .send({ username: 'guest', password: 'guest' })
      .expect(200)
      .expect({
        success: true,
        message: 'Login successful',
        role: 'guest',
        clickCountRequired: 99999,
      });
  });

  it('/api/login (POST) is vulnerable to SQL injection into the admin role', () => {
    return request(app.getHttpServer())
      .post('/api/login')
      .send({ username: 'guest', password: 'x" OR role = "admin" -- "' })
      .expect(200)
      .expect({
        success: true,
        message: 'Login successful',
        role: 'admin',
        clickCountRequired: 99999,
      });
  });

  it('/api/login (POST) returns admin for a broad SQL injection bypass', () => {
    return request(app.getHttpServer())
      .post('/api/login')
      .send({ username: 'guest', password: '" OR 1=1 -- "' })
      .expect(200)
      .expect({
        success: true,
        message: 'Login successful',
        role: 'admin',
        clickCountRequired: 99999,
      });
  });

  it('/api/flag (POST) returns the flag after client-side bypass conditions are met', () => {
    return request(app.getHttpServer())
      .post('/api/flag')
      .send({ currentCount: 0, role: 'admin' })
      .expect(200)
      .expect({
        success: true,
        flag: 'N4U{test-real-flag}',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
