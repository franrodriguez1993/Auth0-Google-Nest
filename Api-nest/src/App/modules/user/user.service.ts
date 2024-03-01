import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Auth0Service } from 'src/App/shared/auth0.service';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly auth0Service: Auth0Service,
  ) {}

  /**
  POST
  **/
  async registerUser(req: Request) {
    const userInfo = await this.auth0Service.getUserInfo(req);
    console.log(userInfo);

    //check if exists:
    const checkUser = await this.findUserByMail(userInfo.data.email);
    if (checkUser) throw new BadRequestException('User already exists');

    return await this.userModel.create({
      email: userInfo.data.email,
      firstName: userInfo.data.given_name,
      lastName: userInfo.data.family_name,
      auth0Id: this.auth0Service.getAuth0Id(req),
      profilePic: userInfo.data.picture,
    });
  }

  /** REGISTER USER BY EMAIL **/
  async registerUserByEmail(email: string, password: string) {}

  async loginUser(req: Request) {
    const auth0Id = this.auth0Service.getAuth0Id(req);
    const user = await this.userModel.findOne({ auth0Id }).lean().exec();
    if (!user) throw new BadRequestException('Invalid credential');
    delete user.auth0Id;
    return user;
  }

  /**
  GET
  **/
  async findUserByMail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async registerAuth0User(data: userDTO) {
    await this.auth0Service.createAuth0User(data.email, data.password);
  }

  /**  GET USER FROM AUTH0 USING EMAIL  **/
  async getUserByEmailAuth0(email: string) {
    return await this.auth0Service.getUserByEmailFromAuth0(email);
  }

  /** DELETE USER IN AUTH0 **/
  async deleteAuth0() {
    const res = await this.auth0Service.deleteAuth0Token(
      'auth0|65a3cf838d9d565392c3f9d4',
    );
    console.log(res);
  }
}
