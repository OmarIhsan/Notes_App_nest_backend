import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('user_category_progress')
@Unique(['userId', 'categoryId'])
export class UserCategoryProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    categoryId: string;

    @Column({ type: 'int', default: 0 })
    completedStages: number;

    @Column({ type: 'int', default: 0 })
    totalStages: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    progressPercentage: number;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastAccessedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'categoryId' })
    category: Category;
}