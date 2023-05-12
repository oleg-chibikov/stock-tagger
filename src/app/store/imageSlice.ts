import { UploadEvent } from '@dataTransferTypes/upload';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageWithData } from '../helpers/imageHelper';

interface ImageState {
  images: ImageWithData[];
  selectedImages: Set<string>;
  newImagesTrigger: boolean;
}

const initialState: ImageState = {
  images: [],
  selectedImages: new Set<string>(),
  newImagesTrigger: false,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ImageWithData[]>) => {
      state.images = action.payload;
      state.newImagesTrigger = !state.newImagesTrigger;
      state.selectedImages.clear();
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedImages.has(action.payload)) {
        state.selectedImages.delete(action.payload);
      } else {
        state.selectedImages.add(action.payload);
      }
    },
    setUpscaledUri: (state, action: PayloadAction<UploadEvent>) => {
      const image = state.images.find((x) => x.name == action.payload.fileName);
      if (image) {
        image.upscaledUri = action.payload.filePath;
        image.uploadedToFtp = false;
      }
    },
    setIsUploadedToFtp: (state, action: PayloadAction<UploadEvent>) => {
      const image = state.images.find((x) => x.name == action.payload.fileName); // TODO: can we store images in a set?
      if (image) {
        image.uploadedToFtp = true;
      }
    },
  },
});

export const {
  setImages,
  setUpscaledUri,
  setIsUploadedToFtp,
  toggleSelection,
} = imageSlice.actions;
export default imageSlice.reducer;
