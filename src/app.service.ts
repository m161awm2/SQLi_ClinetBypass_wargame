import alasql from 'alasql';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly flag =
    process.env.FLAG ?? process.env.FAKE_FLAG ?? 'N4U{fake-flag}';
  private readonly db = new alasql.Database();

  constructor() {
    this.db.exec(`
      CREATE TABLE users (
        username STRING,
        password STRING,
        role STRING
      )
    `);

    this.db.exec(`
      INSERT INTO users VALUES
        ("guest", "guest", "guest"),
        ("admin", "not_guessable_password", "admin")
    `);
  }

  login(username = '', password = '') {
    const rows = this.db.exec(`
      SELECT username, role
      FROM users
      WHERE username = "${String(username)}"
        AND password = "${String(password)}"
      LIMIT 1
    `) as Array<{ username: string; role: string }>;

    const user = rows[0];

    if (user) {
      return {
        success: true,
        message: 'Login successful',
        role: user.role,
        clickCountRequired: 99999,
      };
    }

    throw new UnauthorizedException({
      success: false,
      message: 'Invalid username or password',
    });
  }

  getFlag(currentCount: unknown, role = '') {
    const numericCurrentCount = Number(currentCount);

    if (
      role === 'admin' &&
      Number.isFinite(numericCurrentCount) &&
      numericCurrentCount <= 0
    ) {
      return {
        success: true,
        flag: this.flag,
      };
    }

    throw new UnauthorizedException({
      success: false,
      message: 'Flag conditions not satisfied',
    });
  }
}
