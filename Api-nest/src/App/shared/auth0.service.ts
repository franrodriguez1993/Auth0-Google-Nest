import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticationClient, ManagementClient } from 'auth0';

@Injectable()
export class Auth0Service {
  private AUTH0_DOMAIN: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private managementAPI: ManagementClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.AUTH0_DOMAIN = this.configService.get('AUTH0_DOMAIN');
    this.CLIENT_ID = this.configService.get('CLIENT_ID');
    this.CLIENT_SECRET = this.configService.get('CLIENT_SECRET');

    this.managementAPI = new ManagementClient({
      domain: 'dev-vrkwalqpf3zp60c0.us.auth0.com',
      clientId: this.CLIENT_ID,
      clientSecret: this.CLIENT_SECRET,
    });
  }

  async createAuth0User(email: string, password: string) {
    const domainCleaned = process.env.AUTH0_DOMAIN.replace(
      /^https?:\/\//,
      '',
    ).replace(/\/$/, '');
    const auth0Client = new AuthenticationClient({
      domain: domainCleaned,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
    });
    console.log(`Creando usuario en Auth0: ${email}`);
    try {
      const i = await auth0Client.database.signUp({
        connection: 'Username-Password-Authentication',
        email,
        password,
      });
      console.log(`Usuario creado en Auth0: ${i}`);
      return i;
    } catch (error) {
      console.error(`Error al crear el usuario en Auth0: ${error.message}`);
      throw error;
    }
  }
  async getUserInfo(req: Request) {
    const token = req.header('Authorization');
    return await firstValueFrom(
      this.httpService.get(`${this.AUTH0_DOMAIN}userinfo`, {
        headers: { Authorization: token },
      }),
    );
  }

  getAuth0Id(req: Request) {
    const token = req.header('Authorization');
    if (!token) {
      throw new UnauthorizedException('Error retrieving user id');
    }
    const decodedToken = jwt.decode(token.split(' ')[1], { complete: true });
    if (typeof decodedToken.payload.sub === 'string') {
      return decodedToken.payload.sub.split('|')[1]; // Ex: google-oauth2|105376322685496477873
    } else {
      throw new UnauthorizedException('Error retrieving user id');
    }
  }

  /** GET ACCESS TOKEN **/
  async getAccessTokenAPIManagement() {
    const resAuth0 = await firstValueFrom(
      this.httpService.post(
        `${this.AUTH0_DOMAIN}oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          audience: `${this.AUTH0_DOMAIN}api/v2/`,
        }),
      ),
    );

    return resAuth0.data.access_token;
  }

  /**  GET USER BY EMAIL FROM AUTH0  **/
  async getUserByEmailFromAuth0(email: string) {
    const user = await this.managementAPI.usersByEmail.getByEmail({ email });
    return user;
  }

  /** DELETE AUTH0 USER **/
  async deleteAuth0Token(id: string) {
    return await this.managementAPI.users.delete({ id });
  }
}
