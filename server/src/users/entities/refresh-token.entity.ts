import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column('varchar', { length: 255 })
  @Index({ unique: true })
  tokenHash: string;

  @Column({ type: 'datetime', precision: 3 })
  expiresAt: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  revokedAt: Date | null;

  @Column('char', { length: 36, nullable: true })
  replacedByTokenId: string | null;

  @Column('varchar', { length: 300, nullable: true })
  userAgent: string | null;

  @Column('varchar', { length: 64, nullable: true })
  ip: string | null;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;
}
