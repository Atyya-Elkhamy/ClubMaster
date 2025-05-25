import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    console.log('✅ GoogleStrategy constructor called');
    console.log('clientID:', clientID);
    console.log('callbackURL:', callbackURL);

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', { infer: true })!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', { infer: true })!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', { infer: true })!,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }
  authorizationParams(): Record<string, string> {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('Google access token:', accessToken);
    console.log('Google refresh token:', refreshToken);
    const { name, emails, photos } = profile;
    console.log('Google profile:', profile);
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
      provider: 'google',
    };
    done(null, user);
  }
}


