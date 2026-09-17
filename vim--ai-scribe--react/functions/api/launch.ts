import { Env } from "../context-env";

/** NOTE: Route is `/api/launch` */
export const onRequestGet: PagesFunction<Env> = async (context) => {

  const url = new URL(context.request.url);
  const queryParams = url.searchParams;
  const launchId = queryParams.get("launch_id");

  // Must be listed in the manifest's allowedUrls, or /authorize rejects it.
  const redirect_uri = context.env.REDIRECT_URL ?? "http://localhost:8788";

  const redirectUrl = new URL(
    context.env.VIM_AUTHORIZE_ENDPOINT ??
      "https://api.getvim.ai/app-auth/authorize"
  );
  // `launch`, not `launch_id` — the param is optional on /authorize, so the
  // wrong name silently falls through to the standalone Auth0 flow.
  redirectUrl.searchParams.append("launch", launchId);
  redirectUrl.searchParams.append("client_id", context.env.CLIENT_ID);
  redirectUrl.searchParams.append("redirect_uri", redirect_uri);
  redirectUrl.searchParams.append("response_type", "code");

  return Response.redirect(redirectUrl.toString(), 302);
};
