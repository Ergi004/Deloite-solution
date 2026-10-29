import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn()
  company: Company;

  @Column('varchar', { length: 255, nullable: true })
  email: string | null;

  @Column('varchar', { length: 255 })
  @Index({ unique: true })
  tokenHash: string;

  @Column({ type: 'datetime', precision: 3 })
  expiresAt: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  usedAt: Date | null;

  @Column('char', { length: 36, nullable: true })
  usedByUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  usedByUser: User | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  revokedAt: Date | null;

  @Column('char', { length: 36 })
  createdById: string;

  @Column('varchar', { length: 300, nullable: true })
  note: string | null;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;
}
