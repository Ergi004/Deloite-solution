import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { Company } from '../companies/entities/company.entity';
import { generateRawToken, hashToken } from '../helpers/token.helper';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateBulkInvitationsDto } from './dto/create-bulk-invitations.dto';

export type InvitationValidation =
  | { valid: true; companyName: string; emailLocked: string | null }
  | { valid: false; reason: 'invalid' | 'expired' | 'used' };

export type InvitationStatus = 'pending' | 'used' | 'expired' | 'revoked';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  private async createOne(
    company: Company,
    createdById: string,
    email: string | null,
    note?: string,
  ): Promise<{ invitation: Invitation; rawToken: string }> {
    const rawToken = generateRawToken();
    const expiresAt = new Date(
      Date.now() + company.defaultInviteExpiryDays * 24 * 60 * 60 * 1000,
    );
    const invitation = this.invitationRepository.create({
      companyId: company.id,
      email,
      tokenHash: hashToken(rawToken),
      expiresAt,
      createdById,
      note: note ?? null,
    });
    const saved = await this.invitationRepository.save(invitation);
    return { invitation: saved, rawToken };
  }

  async create(
    company: Company,
    createdById: string,
    dto: CreateInvitationDto,
  ) {
    return this.createOne(company, createdById, dto.email ?? null, dto.note);
  }

  async createBulk(
    company: Company,
    createdById: string,
    dto: CreateBulkInvitationsDto,
  ) {
    if (!dto.emails?.length && !dto.anonymousCount) {
      throw new BadRequestException('Provide either emails or anonymousCount');
    }
    const results: { invitation: Invitation; rawToken: string }[] = [];
    for (const email of dto.emails ?? []) {
      results.push(await this.createOne(company, createdById, email));
    }
    for (let i = 0; i < (dto.anonymousCount ?? 0); i++) {
      results.push(await this.createOne(company, createdById, null));
    }
    return results;
  }

  async validate(rawToken: string): Promise<InvitationValidation> {
    const invitation = await this.invitationRepository.findOne({
      where: { tokenHash: hashToken(rawToken) },
      relations: { company: true },
    });

    if (!invitation || invitation.revokedAt) {
      return { valid: false, reason: 'invalid' };
    }
    if (invitation.usedAt) {
      return { valid: false, reason: 'used' };
    }
    if (invitation.expiresAt.getTime() < Date.now()) {
      return { valid: false, reason: 'expired' };
    }
    return {
      valid: true,
      companyName: invitation.company.name,
      emailLocked: invitation.email,
    };
  }

  /** Re-checks and loads the invitation entity for use inside the registration transaction. */
  async findUsableByRawToken(rawToken: string): Promise<Invitation | null> {
    const invitation = await this.invitationRepository.findOne({
      where: { tokenHash: hashToken(rawToken) },
      relations: { company: true },
    });
    if (
      !invitation ||
      invitation.revokedAt ||
      invitation.usedAt ||
      invitation.expiresAt.getTime() < Date.now()
    ) {
      return null;
    }
    return invitation;
  }

  async revoke(id: string, companyId: string): Promise<void> {
    await this.invitationRepository.update(
      { id, companyId },
      { revokedAt: new Date() },
    );
  }

  async listForCompany(
    companyId: string,
  ): Promise<Array<Invitation & { status: InvitationStatus }>> {
    const invitations = await this.invitationRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return invitations.map((invitation) => ({
      ...invitation,
      status: this.deriveStatus(invitation),
    }));
  }

  private deriveStatus(invitation: Invitation): InvitationStatus {
    if (invitation.revokedAt) return 'revoked';
    if (invitation.usedAt) return 'used';
    if (invitation.expiresAt.getTime() < Date.now()) return 'expired';
    return 'pending';
  }
}
