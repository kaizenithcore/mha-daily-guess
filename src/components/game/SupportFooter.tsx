import { Coffee, Heart, Mail } from "lucide-react";

export function SupportFooter() {
  return (
    <footer className="mt-10 space-y-4">
      <div className="panel-info p-4 text-center">
        <p className="mb-3 text-xs text-muted-foreground">
          ¿Te gusta MHAdle? Ayuda a mantenerlo vivo
        </p>
        <div className="flex items-center justify-center gap-2">
          <a
            href="mailto:hola@kaizenith.es?subject=Feedback%20MHAdle"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Enviar feedback por correo"
          >
            <Mail className="size-3.5" /> Feedback
          </a>
          <a
            href="https://ko-fi.com/kaizenith"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Coffee className="size-3.5" /> Ko-fi
          </a>
          <a
            href="https://patreon.com/kaizenithcore"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:bg-accent hover:text-accent-foreground"
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
