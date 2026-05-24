import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    process.env.FLAG = 'N4U{test-real-flag}';
    process.env.ADMIN_PASSWORD = 'test-admin-password';

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('login', () => {
    it('logs in as guest with the normal credentials', () => {
      expect(
        appController.login({ username: 'guest', password: 'guest' }),
      ).toEqual({
        success: true,
        message: 'Login successful',
        role: 'guest',
        clickCountRequired: 99999,
      });
    });

    it('allows SQL injection to bypass into the admin role', () => {
      expect(
        appController.login({
          username: 'guest',
          password: 'x" OR role = "admin" -- "',
        }),
      ).toEqual({
        success: true,
        message: 'Login successful',
        role: 'admin',
        clickCountRequired: 99999,
      });
    });

    it('returns admin for a broad SQL injection bypass', () => {
      expect(
        appController.login({
          username: 'guest',
          password: '" OR 1=1 -- "',
        }),
      ).toEqual({
        success: true,
        message: 'Login successful',
        role: 'admin',
        clickCountRequired: 99999,
      });
    });

    it('rejects invalid credentials', () => {
      expect(() =>
        appController.login({ username: 'guest', password: 'wrong' }),
      ).toThrow(UnauthorizedException);
    });

    it('rejects malformed SQL injection attempts without leaking errors', () => {
      expect(() =>
        appController.login({ username: 'guest', password: '"admin"--"' }),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('flag', () => {
    it('returns the flag only for admin with currentCount <= 0', () => {
      expect(appController.getFlag({ currentCount: 0, role: 'admin' })).toEqual(
        {
          success: true,
          flag: 'N4U{test-real-flag}',
        },
      );
    });

    it('rejects users who do not satisfy the final condition', () => {
      expect(() =>
        appController.getFlag({ currentCount: 1, role: 'admin' }),
      ).toThrow(UnauthorizedException);
    });
  });
});
