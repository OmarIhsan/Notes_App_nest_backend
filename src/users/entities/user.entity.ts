import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FREE = 'FREE',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.FREE })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEnd: Date;

  @Column({ type: 'int', default: 0 })
  documentsAccessed: number;

  @Column({ type: 'int', default: 0 })
  annotationsCreated: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Subscription, subscription => subscription.user)
  subscription: Subscription;
}