import { InvitationsService } from './invitations.service';
import { hashToken } from '../helpers/token.helper';
import { Invitation } from './entities/invitation.entity';
import { Repository } from 'typeorm';

function makeInvitation(overrides: Partial<Invitation>): Invitation {
  return {
    id: 'inv-1',
    companyId: 'company-1',
    email: null,
    tokenHash: hashToken('raw-token'),
    expiresAt: new Date(Date.now() + 10_000),
    usedAt: null,
    usedByUserId: null,
    revokedAt: null,
    createdById: 'admin-1',
    note: null,
    createdAt: new Date(),
    company: { name: 'Northwind Technologies' } as never,
    ...overrides,
  } as Invitation;
}

describe('InvitationsService.validate', () => {
  function makeService(invitation: Invitation | null) {
    const repo = {
      findOne: jest.fn().mockResolvedValue(invitation),
    } as unknown as Repository<Invitation>;
    return new InvitationsService(repo);
  }

  it('reports a garbage/unknown token as invalid without leaking details', async () => {
    const service = makeService(null);
    const result = await service.validate('whatever');
    expect(result).toEqual({ valid: false, reason: 'invalid' });
  });

  it('reports a revoked token the same as an unknown one', async () => {
    const service = makeService(makeInvitation({ revokedAt: new Date() }));
    const result = await service.validate('raw-token');
    expect(result).toEqual({ valid: false, reason: 'invalid' });
  });

  it('reports a used token as used', async () => {
    const service = makeService(makeInvitation({ usedAt: new Date() }));
    const result = await service.validate('raw-token');
    expect(result).toEqual({ valid: false, reason: 'used' });
  });

  it('reports an expired token as expired', async () => {
    const service = makeService(
      makeInvitation({ expiresAt: new Date(Date.now() - 1000) }),
    );
    const result = await service.validate('raw-token');
    expect(result).toEqual({ valid: false, reason: 'expired' });
  });

  it('reports a pending token as valid with the company name and email lock', async () => {
    const service = makeService(makeInvitation({ email: 'grad@example.com' }));
    const result = await service.validate('raw-token');
    expect(result).toEqual({
      valid: true,
      companyName: 'Northwind Technologies',
      emailLocked: 'grad@example.com',
    });
  });
});

describe('InvitationsService.findUsableByRawToken', () => {
  function makeService(invitation: Invitation | null) {
    const repo = {
      findOne: jest.fn().mockResolvedValue(invitation),
    } as unknown as Repository<Invitation>;
    return new InvitationsService(repo);
  }

  it('returns null for revoked, used, or expired invitations', async () => {
    expect(
      await makeService(
        makeInvitation({ revokedAt: new Date() }),
      ).findUsableByRawToken('raw-token'),
    ).toBeNull();
    expect(
      await makeService(
        makeInvitation({ usedAt: new Date() }),
      ).findUsableByRawToken('raw-token'),
    ).toBeNull();
    expect(
      await makeService(
        makeInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      ).findUsableByRawToken('raw-token'),
    ).toBeNull();
  });

  it('returns the invitation when it is pending and unexpired', async () => {
    const invitation = makeInvitation({});
    const result =
      await makeService(invitation).findUsableByRawToken('raw-token');
    expect(result).toBe(invitation);
  });
});
