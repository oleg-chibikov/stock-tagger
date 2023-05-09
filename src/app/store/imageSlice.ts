import { UploadEvent } from '@dataTransferTypes/upload';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageWithData } from '../helpers/fileHelper';

interface ImageState {
  images: ImageWithData[];
  selectedImages: ImageWithData[]; // TODO: we don't need to keep images themselves, only references to the images (their names etc)!
}

const initialState: ImageState = {
  images: [],
  selectedImages: [],
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ImageWithData[]>) => {
      state.images = action.payload;
    },
    setSelectedImages: (state, action: PayloadAction<ImageWithData[]>) => {
      state.selectedImages = action.payload;
    },
    setUpscaledUri: (state, action: PayloadAction<UploadEvent>) => {
      const image = state.images.find((x) => x.name == action.payload.fileName);
      if (image) {
        image.upscaledUri = action.payload.filePath;
      }
    },
  },
});

export const { setImages, setUpscaledUri, setSelectedImages } =
  imageSlice.actions;
export default imageSlice.reducer;
