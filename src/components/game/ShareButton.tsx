import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { Character } from "@/lib/mhadle";
import { buildShareText } from "@/lib/share";

interface Props {
  puzzleNumber: number;
  attempts: Character[];
  target: Character;
}

export function ShareButton({ puzzleNumber, attempts, target }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText({ puzzleNumber, attempts, target });
    try {
      if (navigator.share) {
        await navigator.share({ title: `MHAdle #${puzzleNumber}`, text });
        return;
      }
    } catch {
      // user cancelled — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-hero focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm"
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "¡Copiado!" : "Compartir resultado"}
    </button>
  );
}
