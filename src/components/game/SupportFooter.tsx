import { Coffee, Heart, Mail } from "lucide-react";

export function SupportFooter() {
  return (
    <footer className="nb-footer mt-12 border-t border-border pt-5">
      <p className="font-hand text-lg leading-snug text-ink">
        ¿Te gusta MHAdle? Es gratis y sin anuncios: si quieres ayudar a mantenerlo vivo…
      </p>
      <div className="mt-2 flex flex-wrap gap-x-5">
        <a
          href="https://ko-fi.com/kaizenith"
          target="_blank"
          rel="noopener noreferrer"
          className="nb-link"
        >
          <Coffee className="size-4" aria-hidden /> Invítame a un café en Ko-fi
        </a>
        <a
          href="https://patreon.com/kaizenithcore"
          target="_blank"
          rel="noopener noreferrer"
          className="nb-link"
        >
          <Heart className="size-4" aria-hidden /> Patreon
        </a>
        <a href="mailto:hola@kaizenith.es?subject=Feedback%20MHAdle" className="nb-link">
          <Mail className="size-4" aria-hidden /> Enviar sugerencias
        </a>
      </div>
      <p className="nb-printed mt-6">Hecho por fans · No oficial · Nuevo héroe a las 00:00 UTC</p>
    </footer>
  );
}
