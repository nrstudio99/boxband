import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BAND_MEMBERS } from "@/lib/band-config";

const STORAGE_KEY = "band:member";

export function useMemberName() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (BAND_MEMBERS as readonly string[]).includes(stored)) {
        setName(stored);
      } else if (stored) {
        localStorage.removeItem(STORAGE_KEY);
      }
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
  const [value, setValue] = useState<string>("");

  const handle = (e: FormEvent) => {
    e.preventDefault();
    if (!value) return;
    onSubmit(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form
        onSubmit={handle}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Quem és?</h2>
          <p className="text-sm text-muted-foreground">
            Escolhe o teu nome para marcar a tua disponibilidade.
          </p>
        </div>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Seleciona o teu nome" />
          </SelectTrigger>
          <SelectContent>
            {BAND_MEMBERS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full" disabled={!value}>
          Continuar
        </Button>
      </form>
    </div>
  );
}
