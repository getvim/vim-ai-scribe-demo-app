import { getKey, importKey, parseJwt } from "@cfworker/jwt";
import { Env } from "../context-env";

/** NOTE: Route is `/api/token` */
async function getToken(context, code: string, client_secret: string) {
  return fetch(
    context.env.VIM_TOKEN_ENDPOINT ?? "https://api.getvim.ai/app-auth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: context.env.CLIENT_ID,
        code,
        client_secret,
        grant_type: "authorization_code",
      }),
    }
  );
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { code } = await context.request.json<{ code: string }>();
  let vimResponse = await getToken(context, code, context.env.CLIENT_SECRET);
  if (
    vimResponse.status >= 400 &&
    vimResponse.status < 500 &&
    context.env.CLIENT_SECRET_FALLBACK
  ) {
    vimResponse = await getToken(
      context,
      code,
      context.env.CLIENT_SECRET_FALLBACK
    );
  }
  const vimResponseClone = vimResponse.clone();
  try {
    const tokenData = await vimResponse.json();

    if (
      !(await isAuthorized(
        tokenData,
        context.env.CLIENT_ID,
        context.env.VIM_ISSUER,
        context.env.VIM_JWKS_URL
      ))
    ) {
      return new Response("", {
        status: 403,
        statusText: "Forbidden: You do not have access to this resource.",
      });
    }

    return Response.json(tokenData);
  } catch (error) {
    const vimResponseText = await vimResponseClone.text();
    console.log("Error parsing vim response", {
      vimResponseText,
    });
    throw error;
  }
};

const VIM_JWKS_URL = "https://api.getvim.ai/app-auth/.well-known/jwks.json";

let primed: Promise<void> | null = null;

/**
 * Vim serves its JWKS under a different host than the token's `iss`, so
 * @cfworker/jwt's default resolver looks in the wrong place. Load the keys into
 * its cache under the issuer the token actually carries.
 */
function primeVimKeys(iss: string, jwksUrl: string): Promise<void> {
  primed ??= (async () => {
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(
        `Error loading jwks at ${jwksUrl}. ${response.status} ${response.statusText}`
      );
    }
    const { keys } = await response.json<{ keys: JsonWebKey[] }>();
    await Promise.all(keys.map((jwk) => importKey(iss, jwk)));
  })().catch((error) => {
    primed = null;
    throw error;
  });
  return primed;
}

async function isAuthorized(
  vimTokenData,
  clientId: string,
  vimIssuer = "https://connect.getvim.ai",
  jwksUrl = VIM_JWKS_URL
) {
  try {
    const decodedIdToken = await parseJwt({
      jwt: vimTokenData.id_token,
      issuer: vimIssuer,
      audience: clientId,
      resolveKey: async (decoded) => {
        await primeVimKeys(decoded.payload.iss, jwksUrl);
        return getKey(decoded);
      },
    });
    if (decodedIdToken.valid) {
      // If identification data on token is not sufficient userinfo endpoint can be used...
      return await isUserEligibleToMyApp({
        email: decodedIdToken.payload["email"],
        vimUserId: decodedIdToken.payload["sub"],
      });
    } else if (decodedIdToken.valid === false) {
      console.error(
        `Failed to parse jwt ${decodedIdToken.reason} [${decodedIdToken.reasonCode}]`,
        {
          vimTokenData,
          vimIssuer,
          clientId,
        }
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying token", error);
    return false;
  }
}

async function isUserEligibleToMyApp({ email, vimUserId }) {
  console.info(`User ${email}, ${vimUserId} is eligible to my app.`);
  return true;
}
