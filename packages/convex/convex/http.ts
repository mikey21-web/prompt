import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

http.route({
  path: "/v1/optimize",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let body: { prompt?: string; mode?: string; targetModel?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { prompt, mode = "compress", targetModel = "auto" } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      const result = await ctx.runAction(api.optimize.optimizeViaApi, {
        apiKey,
        prompt,
        mode,
        targetModel,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Internal error";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }),
});

http.route({
  path: "/v1/optimize",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

export default http;
