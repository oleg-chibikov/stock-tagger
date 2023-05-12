interface Caption {
  caption: string;
  similarity: number;
}

interface CaptionEvent extends Caption {
  fileName: string;
  isFromFileMetadata: boolean;
}

export type { Caption, CaptionEvent };
