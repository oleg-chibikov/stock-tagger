declare module 'png-chunk-text' {
  export interface PNGTextChunk {
    keyword: string;
    text: string;
  }

  function decode(chunks: Buffer): PNGTextChunk;
  const obj = { decode };

  export default obj;
}
