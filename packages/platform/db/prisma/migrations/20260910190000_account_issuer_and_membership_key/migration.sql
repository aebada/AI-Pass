-- Account.issuer is added by the migration already merged into `rewan`:
-- 20260916090000_add_account_issuer.
--
-- Better Auth's organization plugin writes team_member.membershipKey when
-- adding a member to a workspace. The initial migration did not include it.

ALTER TABLE "team_member" ADD COLUMN "membershipKey" TEXT;

CREATE UNIQUE INDEX "team_member_membershipKey_key"
ON "team_member"("membershipKey");
