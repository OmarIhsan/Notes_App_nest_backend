import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';


@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ type: 'int', default: 0 })
    totalStages: number;

    @Column({ type: 'int', default: 0 })
    totalDocuments: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    displayOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships - will be added when UserCategoryProgress is implemented
}