import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'placeholder-id',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'placeholder-secret',
      callbackURL: 'http://localhost:9000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { username, displayName, emails, photos, id } = profile;
    const user = {
      ssoId: id,
      username: username,
      email: emails[0].value,
      firstName: displayName ? displayName.split(' ')[0] : username,
      lastName: displayName ? displayName.split(' ').slice(1).join(' ') : '',
      picture: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
    };
    done(null, user);
  }
}
