import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getCloudflareContext } from "@cloudflare/vite-plugin";

type Env = { ENSAIOS_DB: D1Database };

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const APIRoute = createAPIFileRoute("/api/availability")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const { env } = await getCloudflareContext<Env>();

    let query = "SELECT id, member_name, date, status FROM availability";
    const params: string[] = [];

    if (from && to) {
      query += " WHERE date >= ? AND date <= ?";
      params.push(from, to);
    } else if (from) {
      query += " WHERE date >= ?";
      params.push(from);
    } else if (to) {
      query += " WHERE date <= ?";
      params.push(to);
    }

    query += " ORDER BY date";

    const result = await env.ENSAIOS_DB.prepare(query)
      .bind(...params)
      .all();

    return Response.json(result.results ?? []);
  },

  POST: async ({ request }) => {
    const { env } = await getCloudflareContext<Env>();
    const body = (await request.json()) as {
      member_name: string;
      date: string;
      status: string;
    };

    const id = generateId();
    const now = new Date().toISOString();

    await env.ENSAIOS_DB.prepare(
      "INSERT INTO availability (id, member_name, date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(id, body.member_name, body.date, body.status, now, now)
      .run();

    const row = await env.ENSAIOS_DB.prepare(
      "SELECT id, member_name, date, status FROM availability WHERE id = ?"
    )
      .bind(id)
      .first();

    return Response.json(row, { status: 201 });
  },

  PATCH: async ({ request }) => {
    const { env } = await getCloudflareContext<Env>();
    const body = (await request.json()) as { id: string; status: string };
    const now = new Date().toISOString();

    await env.ENSAIOS_DB.prepare(
      "UPDATE availability SET status = ?, updated_at = ? WHERE id = ?"
    )
      .bind(body.status, now, body.id)
      .run();

    const row = await env.ENSAIOS_DB.prepare(
      "SELECT id, member_name, date, status FROM availability WHERE id = ?"
    )
      .bind(body.id)
      .first();

    return Response.json(row);
  },

  DELETE: async ({ request }) => {
    const { env } = await getCloudflareContext<Env>();
    const body = (await request.json()) as { id: string };

    await env.ENSAIOS_DB.prepare("DELETE FROM availability WHERE id = ?")
      .bind(body.id)
      .run();

    return Response.json({ success: true });
  },
});
