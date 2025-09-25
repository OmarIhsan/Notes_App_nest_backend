import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCategories,
      activeUsers,
    ] = await Promise.all([
      this.userRepository.count(),
      this.categoryRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalCategories,
      activeUsers,
      // Placeholder for future entities
      totalGroups: 0,
      totalLectures: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
    };
  }

  async getRecentActivity() {
    const [recentUsers, recentCategories] = await Promise.all([
      this.userRepository.find({
        take: 5,
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),
      this.categoryRepository.find({
        take: 5,
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          isActive: true,
        },
      }),
    ]);

    return {
      recentUsers,
      recentCategories,
      // Placeholder for future entities
      recentLectures: [],
      recentGroups: [],
    };
  }

  async getSystemLogs(page = 1, limit = 50) {
    // For now, return empty logs since we don't have a SystemLog entity yet
    // TODO: Create SystemLog entity and implement logging
    return {
      logs: [],
      total: 0,
      pages: 0,
      currentPage: page,
    };
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.userRepository.find({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscriptionStatus: true,
          createdAt: true,
          lastLogin: true,
          isActive: true,
          documentsAccessed: true,
          annotationsCreated: true,
        },
      }),
      this.userRepository.count(),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllGroups(page = 1, limit = 50) {
    // For now, return empty groups since we don't have Group entities yet
    // TODO: Create Group entity and implement group management
    return {
      groups: [],
      total: 0,
      pages: 0,
      currentPage: page,
    };
  }

  async getAllLectures(page = 1, limit = 50) {
    // For now, return empty lectures since we don't have Lecture entities yet
    // TODO: Create Lecture entity and implement lecture management
    return {
      lectures: [],
      total: 0,
      pages: 0,
      currentPage: page,
    };
  }
}