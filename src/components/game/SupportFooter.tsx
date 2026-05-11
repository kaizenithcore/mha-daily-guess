import { Coffee, Heart } from "lucide-react";

export function SupportFooter() {
  return (
    <footer className="mt-10 space-y-4">
      <div className="panel-hero p-4 text-center">
        <p className="text-xs text-muted-foreground mb-3">
          ¿Te gusta MHAdle? Ayuda a mantenerlo vivo
        </p>
        <div className="flex items-center justify-center gap-2">
          <a
            href="https://ko-fi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
          >
            <Coffee className="size-3.5" /> Ko-fi
          </a>
          <a
            href="https://patreon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-secondary hover:bg-accent hover:text-accent-foreground hover:border-accent transition"
          >
            <Heart className="size-3.5" /> Patreon
          </a>
        </div>
      </div>
      <p className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        Hecho por fans · No oficial · Reset 00:00 UTC
      </p>
    </footer>
  );
}
