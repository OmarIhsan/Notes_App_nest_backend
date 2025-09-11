import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}