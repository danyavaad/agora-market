/*
 * File: jwt.strategy.ts
 * Purpose: Extract and validate JWT from Authorization header
 * Dependencies: passport-jwt
 * Domain: Authentication
 */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// TODO: Move secret to environment variable
export const jwtConstants = {
    secret: 'DO_NOT_USE_THIS_IN_PRODUCTION_SECRET_KEY',
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
