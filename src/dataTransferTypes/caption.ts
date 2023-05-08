interface Caption {
  caption: string;
  similarity: number;
}

interface CaptionEvent extends Caption {
  fileName: string;
}

export type { Caption, CaptionEvent };
