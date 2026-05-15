import { useEffect, useState, type FormEvent } from "react";
import { SITE_PASSWORD } from "@/lib/band-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music2 } from "lucide-react";

const STORAGE_KEY = "band:auth";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pw === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Password incorreta.");
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Music2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Ensaios da Banda
          </h1>
          <p className="text-sm text-muted-foreground">
            Introduz a password para entrar.
          </p>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
