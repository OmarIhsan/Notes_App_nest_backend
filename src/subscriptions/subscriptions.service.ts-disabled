import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, SubscriptionPlan } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    // Check if user already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Calculate subscription dates based on plan
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, createSubscriptionDto.plan);

    // Set default features based on plan
    const planFeatures = this.getPlanFeatures(createSubscriptionDto.plan);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan: createSubscriptionDto.plan,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: createSubscriptionDto.autoRenew,
        paymentMethod: createSubscriptionDto.paymentMethod,
        paymentReference: createSubscriptionDto.paymentReference,
        amount: createSubscriptionDto.amount,
        currency: createSubscriptionDto.currency || 'USD',
        maxDownloads: createSubscriptionDto.maxDownloads || planFeatures.maxDownloads,
        maxGroups: createSubscriptionDto.maxGroups || planFeatures.maxGroups,
        aiFeatures: createSubscriptionDto.aiFeatures || planFeatures.aiFeatures,
        prioritySupport: createSubscriptionDto.prioritySupport || planFeatures.prioritySupport,
      },
    });

    // Update user's subscription info
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: createSubscriptionDto.plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });

    return subscription;
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCurrentSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
        },
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Update subscription status
    const cancelledSubscription = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    // Update user's subscription status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'CANCELLED',
      },
    });

    return cancelledSubscription;
  }

  async renewSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: 'ACTIVE' },
          { status: 'EXPIRED' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found to renew');
    }

    // Calculate new dates
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, subscription.plan);

    // Create new subscription record
    const renewedSubscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan: subscription.plan,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod,
        amount: subscription.amount,
        currency: subscription.currency,
        maxDownloads: subscription.maxDownloads,
        maxGroups: subscription.maxGroups,
        aiFeatures: subscription.aiFeatures,
        prioritySupport: subscription.prioritySupport,
      },
    });

    // Update user's subscription info
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: subscription.plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });

    return renewedSubscription;
  }

  async checkAndExpireSubscriptions() {
    const now = new Date();
    
    // Find expired subscriptions
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now,
        },
      },
    });

    // Update expired subscriptions
    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });

      // Update user status to FREE if no auto-renew
      if (!subscription.autoRenew) {
        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: {
            subscriptionPlan: 'FREE',
            subscriptionStatus: 'INACTIVE',
          },
        });
      }
    }

    return expiredSubscriptions.length;
  }

  private calculateEndDate(startDate: Date, plan: string): Date {
    const endDate = new Date(startDate);
    
    switch (plan) {
      case 'BASIC':
      case 'PREMIUM':
        endDate.setMonth(endDate.getMonth() + 1); // 1 month
        break;
      case 'ENTERPRISE':
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1); // Default 1 month
    }

    return endDate;
  }

  private getPlanFeatures(plan: string) {
    const features = {
      'FREE': {
        maxDownloads: 10,
        maxGroups: 2,
        aiFeatures: false,
        prioritySupport: false,
      },
      'BASIC': {
        maxDownloads: 50,
        maxGroups: 5,
        aiFeatures: false,
        prioritySupport: false,
      },
      'PREMIUM': {
        maxDownloads: 200,
        maxGroups: 15,
        aiFeatures: true,
        prioritySupport: true,
      },
      'ENTERPRISE': {
        maxDownloads: 1000,
        maxGroups: 50,
        aiFeatures: true,
        prioritySupport: true,
      },
    };

    return features[plan] || features['FREE'];
  }
}