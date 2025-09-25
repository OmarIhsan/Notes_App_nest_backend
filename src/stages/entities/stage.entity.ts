import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

export interface StageRequirements {
  minimumDocuments?: number;
  requiredAnnotations?: number;
  timeLimit?: number;
}

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'stage_number', default: 1 })
  stageNumber: number;

  @Column({ name: 'display_order', type: 'decimal', precision: 10, scale: 2, default: 1 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    name: 'requirements'
  })
  requirements: StageRequirements;

  @Column({ 
    name: 'estimated_duration',
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    nullable: true,
    comment: 'Estimated duration in minutes'
  })
  estimatedDuration: number;

  @Column({ 
    name: 'prerequisite_stages',
    type: 'text',
    array: true,
    default: '{}',
    nullable: true
  })
  prerequisiteStages: string[];

  @Column({ 
    name: 'minimum_score',
    type: 'decimal', 
    precision: 5, 
    scale: 2,
    nullable: true,
    comment: 'Minimum score required to pass this stage'
  })
  minimumScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // TODO: Add relationships when User Progress entity is created
  // @OneToMany(() => UserStageProgress, progress => progress.stage)
  // userProgress: UserStageProgress[];
}