// Returns a short-lived signed URL for a target user's profile image,
// only if the caller is the owner, has an unlock record, or has a match.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { target_id } = await req.json().catch(() => ({}));
    if (!target_id || typeof target_id !== "string") {
      return new Response(JSON.stringify({ error: "missing_target" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the user's JWT so the SECURITY DEFINER RPC sees auth.uid()
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: auth } },
    });
    const { data: path, error: rpcErr } = await userClient.rpc("get_profile_image_path", { _target: target_id });
    if (rpcErr) throw rpcErr;
    if (!path) {
      return new Response(JSON.stringify({ url: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role signs the URL
    const admin = createClient(url, svc);
    const { data: signed, error: signErr } = await admin.storage
      .from("profile-images")
      .createSignedUrl(path as string, 60 * 60); // 1 hour
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
