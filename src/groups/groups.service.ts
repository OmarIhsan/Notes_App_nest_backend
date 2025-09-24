import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto, GroupRole } from './dto/join-group.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    const group = await this.prisma.lectureGroup.create({
      data: {
        ...createGroupDto,
        createdBy: userId,
        userGroups: {
          create: {
            userId,
            role: 'OWNER',
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        },
      },
      include: {
        userGroups: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        lectures: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            subject: true,
            createdAt: true,
          },
        },
      },
    });

    return group;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LectureGroupWhereInput;
    orderBy?: Prisma.LectureGroupOrderByWithRelationInput;
    userId?: string;
  }) {
    const { skip = 0, take = 20, where, orderBy, userId } = params;

    const groups = await this.prisma.lectureGroup.findMany({
      skip,
      take,
      where: {
        ...where,
        isActive: true,
        OR: [
          { isPrivate: false },
          userId ? { userGroups: { some: { userId } } } : {},
        ],
      },
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        userGroups: {
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        lectures: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            subject: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            lectures: true,
            userGroups: true,
          },
        },
      },
    });

    return groups;
  }

  async findOne(id: string, userId?: string) {
    const group = await this.prisma.lectureGroup.findUnique({
      where: { id, isActive: true },
      include: {
        userGroups: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        lectures: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                downloads: true,
              },
            },
          },
        },
        _count: {
          select: {
            lectures: true,
            userGroups: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check access for private groups
    if (group.isPrivate && userId) {
      const userGroup = group.userGroups.find(ug => ug.userId === userId);
      if (!userGroup) {
        throw new ForbiddenException('Access denied to this private group');
      }
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    const group = await this.findOne(id, userId);
    
    // Check permissions
    const userGroup = group.userGroups.find(ug => ug.userId === userId);
    if (!userGroup || !['OWNER', 'ADMIN'].includes(userGroup.role)) {
      throw new ForbiddenException('Insufficient permissions to update group');
    }

    return this.prisma.lectureGroup.update({
      where: { id },
      data: updateGroupDto,
      include: {
        userGroups: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const group = await this.findOne(id, userId);
    
    // Only owner can delete group
    const userGroup = group.userGroups.find(ug => ug.userId === userId);
    if (!userGroup || userGroup.role !== 'OWNER') {
      throw new ForbiddenException('Only the group owner can delete the group');
    }

    // Soft delete
    return this.prisma.lectureGroup.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async joinGroup(groupId: string, userId: string, joinGroupDto?: JoinGroupDto) {
    const group = await this.prisma.lectureGroup.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        userGroups: {
          where: { userId },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is already a member
    if (group.userGroups.length > 0) {
      throw new ConflictException('You are already a member of this group');
    }

    // Create membership request/join
    const status = group.requiresApproval ? 'PENDING' : 'APPROVED';
    const approvedAt = status === 'APPROVED' ? new Date() : null;

    const userGroup = await this.prisma.userGroup.create({
      data: {
        userId,
        groupId,
        role: joinGroupDto?.role || 'MEMBER',
        status,
        approvedAt,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
    });

    return userGroup;
  }

  async leaveGroup(groupId: string, userId: string) {
    const userGroup = await this.prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      include: {
        group: true,
      },
    });

    if (!userGroup) {
      throw new NotFoundException('You are not a member of this group');
    }

    // Owner cannot leave group unless transferring ownership
    if (userGroup.role === 'OWNER') {
      const otherAdmins = await this.prisma.userGroup.count({
        where: {
          groupId,
          role: 'ADMIN',
          status: 'APPROVED',
        },
      });

      if (otherAdmins === 0) {
        throw new ForbiddenException('Cannot leave group as owner. Transfer ownership first or delete the group.');
      }
    }

    await this.prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return { message: 'Successfully left the group' };
  }

  async approveMembership(groupId: string, targetUserId: string, approverId: string) {
    const group = await this.findOne(groupId, approverId);
    
    // Check approver permissions
    const approver = group.userGroups.find(ug => ug.userId === approverId);
    if (!approver || !['OWNER', 'ADMIN', 'MODERATOR'].includes(approver.role)) {
      throw new ForbiddenException('Insufficient permissions to approve memberships');
    }

    // Find pending membership
    const pendingMembership = group.userGroups.find(
      ug => ug.userId === targetUserId && ug.status === 'PENDING'
    );

    if (!pendingMembership) {
      throw new NotFoundException('No pending membership found for this user');
    }

    return this.prisma.userGroup.update({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateMemberRole(groupId: string, targetUserId: string, newRole: GroupRole, updaterId: string) {
    const group = await this.findOne(groupId, updaterId);
    
    // Check updater permissions
    const updater = group.userGroups.find(ug => ug.userId === updaterId);
    if (!updater || !['OWNER', 'ADMIN'].includes(updater.role)) {
      throw new ForbiddenException('Insufficient permissions to update member roles');
    }

    // Find target member
    const targetMember = group.userGroups.find(ug => ug.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('Member not found in this group');
    }

    // Only owners can promote to admin or change owner role
    if (updater.role !== 'OWNER' && (newRole === 'ADMIN' || targetMember.role === 'OWNER')) {
      throw new ForbiddenException('Only the group owner can manage admin roles');
    }

    return this.prisma.userGroup.update({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async searchGroups(query: string, filters: {
    subject?: string;
    university?: string;
    isPrivate?: boolean;
  }) {
    const whereConditions: Prisma.LectureGroupWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.subject) {
      whereConditions.subject = { contains: filters.subject, mode: 'insensitive' };
    }

    if (filters.university) {
      whereConditions.university = { contains: filters.university, mode: 'insensitive' };
    }

    if (filters.isPrivate !== undefined) {
      whereConditions.isPrivate = filters.isPrivate;
    } else {
      // Default to public groups only for search
      whereConditions.isPrivate = false;
    }

    return this.prisma.lectureGroup.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: {
            lectures: true,
            userGroups: true,
          },
        },
      },
      orderBy: [
        { userGroups: { _count: 'desc' } },
        { lectures: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
    });
  }
}