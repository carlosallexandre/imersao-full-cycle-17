import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const users = [
  {
    id: 1,
    name: 'john',
    password: 'john',
  },
  {
    id: 2,
    name: 'chris',
    password: 'chris',
  },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(username: string, password: string) {
    const user = users.find(
      (u) => u.name === username && u.password === password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      access_token: this.jwtService.sign({ sub: user.id, username: user.name }),
    };
  }
}
