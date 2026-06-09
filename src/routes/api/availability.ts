import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");

        let q = supabaseAdmin
          .from("availability")
          .select("id, member_name, date, status")
          .order("date");

        if (from) q = q.gte("date", from);
        if (to) q = q.lte("date", to);

        const { data, error } = await q;
        if (error) return new Response(error.message, { status: 500 });
        return Response.json(data ?? []);
      },

      POST: async ({ request }) => {
        const body = (await request.json()) as {
          member_name: string;
          date: string;
          status: string;
        };

        const { data, error } = await supabaseAdmin
          .from("availability")
          .insert({
            member_name: body.member_name,
            date: body.date,
            status: body.status as never,
          })
          .select("id, member_name, date, status")
          .single();

        if (error) return new Response(error.message, { status: 500 });
        return Response.json(data, { status: 201 });
      },

      PATCH: async ({ request }) => {
        const body = (await request.json()) as { id: string; status: string };

        const { data, error } = await supabaseAdmin
          .from("availability")
          .update({ status: body.status as never, updated_at: new Date().toISOString() })
          .eq("id", body.id)
          .select("id, member_name, date, status")
          .single();

        if (error) return new Response(error.message, { status: 500 });
        return Response.json(data);
      },

      DELETE: async ({ request }) => {
        const body = (await request.json()) as { id: string };
        const { error } = await supabaseAdmin
          .from("availability")
          .delete()
          .eq("id", body.id);

        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ success: true });
      },
    },
  },
});
