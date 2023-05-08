declare module 'png-chunks-extract' {
  export interface PNGChunk {
    name: string;
    data: Buffer;
    length: number;
    crc32: number;
  }

  function extractChunks(buffer: Buffer): PNGChunk[];

  export default extractChunks;
}
