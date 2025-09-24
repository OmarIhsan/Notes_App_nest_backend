import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalGroups,
      totalLectures,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lectureGroup.count({ where: { isActive: true } }),
      this.prisma.lecture.count({ where: { isActive: true } }),
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      totalGroups,
      totalLectures,
      totalSubscriptions,
      activeSubscriptions,
    };
  }

  async getRecentActivity() {
    const [recentUsers, recentLectures, recentGroups] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          subscriptionPlan: true,
        },
      }),
      this.prisma.lecture.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          group: {
            select: {
              name: true,
              subject: true,
            },
          },
        },
      }),
      this.prisma.lectureGroup.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          subject: true,
          university: true,
          createdAt: true,
          _count: {
            select: {
              userGroups: true,
              lectures: true,
            },
          },
        },
      }),
    ]);

    return {
      recentUsers,
      recentLectures,
      recentGroups,
    };
  }

  async getSystemLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const logs = await this.prisma.systemLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.systemLog.count();

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        lastActiveAt: true,
        isActive: true,
        _count: {
          select: {
            userGroups: true,
            downloadHistory: true,
          },
        },
      },
    });

    const total = await this.prisma.user.count();

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllGroups(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const groups = await this.prisma.lectureGroup.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            userGroups: true,
            lectures: true,
          },
        },
      },
    });

    const total = await this.prisma.lectureGroup.count();

    return {
      groups,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllLectures(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const lectures = await this.prisma.lecture.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            downloads: true,
          },
        },
      },
    });

    const total = await this.prisma.lecture.count();

    return {
      lectures,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}