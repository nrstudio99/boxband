import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "band:member";

export function useMemberName() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setName(localStorage.getItem(STORAGE_KEY));
    }
  }, []);
  const save = (n: string) => {
    localStorage.setItem(STORAGE_KEY, n);
    setName(n);
  };
  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setName(null);
  };
  return { name, save, clear };
}

export function MemberGate({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState("");

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    onSubmit(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form
        onSubmit={handle}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Como te chamas?</h2>
          <p className="text-sm text-muted-foreground">
            O teu nome será associado às marcações que fizeres.
          </p>
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="O teu nome"
          maxLength={40}
          autoFocus
        />
        <Button type="submit" className="w-full" disabled={value.trim().length < 2}>
          Continuar
        </Button>
      </form>
    </div>
  );
}
