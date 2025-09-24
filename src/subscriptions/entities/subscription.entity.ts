import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionPlan {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true })
    userId: string;

    @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
    plan: SubscriptionPlan;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
    status: SubscriptionStatus;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate?: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount?: number;

    @Column({ nullable: true })
    currency?: string;

    @Column({ nullable: true })
    paymentMethod?: string;

    @Column({ nullable: true })
    paymentReference?: string;

    @Column({ type: 'json', nullable: true })
    features?: {
        maxCategories: number;
        maxDocuments: number;
        annotationLimit: number;
        storageLimit: number; // in MB
        premiumSupport: boolean;
        advancedAnalytics: boolean;
        exportFeatures: boolean;
    };

    @Column({ default: false })
    autoRenew: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastPaymentDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextPaymentDate?: Date;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @OneToOne(() => User, user => user.subscription)
    @JoinColumn({ name: 'userId' })
    user: User;
}