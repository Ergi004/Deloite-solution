import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36, nullable: true })
  @Index()
  companyId: string | null;

  @Column('char', { length: 36, nullable: true })
  actorId: string | null;

  @Column('varchar', { length: 100 })
  action: string;

  @Column('varchar', { length: 100 })
  entityType: string;

  @Column('char', { length: 36, nullable: true })
  entityId: string | null;

  @Column('json', { nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;
}
