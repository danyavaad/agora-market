/*
 * File: jwt-auth.guard.ts
 * Purpose: Guard to protect endpoints using JWT
 * Dependencies: AuthGuard
 * Domain: Authentication
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
