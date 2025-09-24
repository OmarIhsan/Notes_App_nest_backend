import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiBearerAuth()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto, @CurrentUser() user: any) {
    return this.subscriptionsService.create(createSubscriptionDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all subscriptions (admin only)' })
  @ApiBearerAuth()
  async findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user subscriptions' })
  @ApiBearerAuth()
  async findUserSubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.findUserSubscriptions(user.id);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current active subscription' })
  @ApiBearerAuth()
  async findCurrentSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.findCurrentSubscription(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update subscription' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel current subscription' })
  @ApiBearerAuth()
  async cancelSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }

  @Post('renew')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiBearerAuth()
  async renewSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.renewSubscription(user.id);
  }
}