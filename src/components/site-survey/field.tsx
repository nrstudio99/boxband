import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
  full,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  full?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2 lg:col-span-3", className)}>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function Section({
  number,
  title,
  children,
  className,
}: {
  number: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("scroll-mt-24", className)} id={`seccao-${number}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {number}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </CardContent>
    </Card>
  );
}
