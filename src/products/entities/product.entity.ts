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
import { ProductImage } from './productImage.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;
    
    @Column({ nullable: true })
    image: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Category, category => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column()
    categoryId: number;

    @OneToMany(() => ProductImage, image => image.product, {
        cascade: true
    })
    images: ProductImage[];
}