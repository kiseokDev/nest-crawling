import {
  ICommandHandler,
  ICommand,
  CommandHandler,
  QueryHandler,
  IQueryHandler,
  EventBus,
  EventsHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { CqrsEvent, TestEvent, UserCreatedEvent } from './user.event';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';
import * as uuid from 'uuid';
export class CreateUserCommand implements ICommand {
  constructor(
    readonly name: string,
    readonly email: string,
    readonly password: string,
  ) {}
}

export class GetUserInfoQuery {
  constructor(public readonly userId: string) {}
}

@EventsHandler(CqrsEvent)
export class UserEventHandler
  implements IEventHandler<UserCreatedEvent | TestEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserCreatedEvent | TestEvent) {
    if (event instanceof UserCreatedEvent) {
      console.log('User created event!!!');
      this.emailService.sendMemberJoinVerification(
        event.email,
        event.signupVerifytoken,
      );
    }
    if (event instanceof TestEvent) {
      console.log('Test event!!!!!!');
    }
  }
}
@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async execute(query: GetUserInfoQuery): Promise<User> {
    if (!Types.ObjectId.isValid(query.userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.userModel.findById(query.userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name)
    private model: Model<User>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { name, email, password } = command;
    const signupVerifytoken = uuid.v1();
    const user = new this.model({ name, email, password, signupVerifytoken });
    if (!user) {
      return null;
    }
    this.eventBus.publish(new UserCreatedEvent(email, signupVerifytoken));
    this.eventBus.publish(new TestEvent());
    return await user.save();
  }
}
