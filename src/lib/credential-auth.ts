export type LoginCandidate = {
  id: string;
  organizationId: string;
  passwordHash: string;
  active: boolean;
};

type CredentialRepository = {
  organization: {
    findUnique(args: { where: { loginCode: string }; select: { id: true } }): Promise<{ id: string } | null>;
  };
  user: {
    findUnique(args: {
      where: { organizationId_email: { organizationId: string; email: string } };
      include: { role: true };
    }): Promise<LoginCandidate | null>;
  };
};

/** Resuelve una identidad dentro de un tenant explícito; nunca elige con findFirst. */
export async function findLoginCandidate(
  repository: CredentialRepository,
  organizationCode: string,
  email: string,
) {
  const organization = await repository.organization.findUnique({
    where: { loginCode: organizationCode },
    select: { id: true },
  });
  if (!organization) return null;

  const user = await repository.user.findUnique({
    where: { organizationId_email: { organizationId: organization.id, email } },
    include: { role: true },
  });
  if (!user || !user.active || user.organizationId !== organization.id) return null;
  return user;
}
