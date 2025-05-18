import { useVimOsContext } from "@/providers/VimOSContext";

/**
 * Securely fetches the current user's first and last name using the VimOS SDK session context.
 * Does not expose sensitive error details. Only returns first and last name.
 *
 * @returns { providerName, loading }
 */
export function useProviderName() {
  const vimOS = useVimOsContext();

  const { firstName, lastName } = vimOS.sessionContext.user.demographics || {};
  return [firstName, lastName].filter(Boolean).join(" ");
}
