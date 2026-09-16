/**
 * GAP — not migrated. The legacy SDK exposed the signed-in user's name at
 * `sessionContext.user.demographics`. The Vim Connect `sessionContext` carries only
 * `sessionId`, `deviceId`, `userId` (a UUID), `account` and `ehrType` — there is no name.
 *
 * `ehr.api.provider.getById()` and `encounter.provider` give the EHR provider on the
 * record, which is a different thing from the logged-in Vim user and may not be the same
 * person. Picking one is a product decision, so this returns nothing until someone makes it.
 */
export function useProviderName(): string {
  return "";
}
