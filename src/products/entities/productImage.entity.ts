import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { Product } from './product.entity';

@Entity('productImage')
export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @Column({ nullable: false })
    image: string;

    @Column({ type: 'boolean', default: false })
    isPrimary: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    altText?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Product, (product: Product) => product.images)
    @JoinColumn({ name: 'productId' })
    product: Product;

    
}
