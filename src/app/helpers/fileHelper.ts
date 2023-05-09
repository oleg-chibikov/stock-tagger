const fileToUri = async (file: File): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
  });
};

const toBase64 = (imageData: ImageWithData) => imageData.uri.split(',')[1];

const toFile = (imageData: ImageWithData): File => {
  const base64 = toBase64(imageData);
  const decodedData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([decodedData], { type: imageData.type });
  return new File([blob], imageData.name, { type: imageData.type });
};

const getImageData = async (file: File): Promise<ImageWithData> => {
  const uri = await fileToUri(file);
  return {
    name: file.name,
    uri: uri,
    type: file.type,
  };
};

interface ImageWithData {
  name: string;
  uri: string;
  type: string;
  upscaledUri?: string;
}

export type { ImageWithData };
export { fileToUri, toBase64, toFile, getImageData };
