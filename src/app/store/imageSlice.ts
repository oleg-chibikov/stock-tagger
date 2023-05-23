import { UploadEvent } from '@dataTransferTypes/upload';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageWithData } from '../helpers/imageHelper';

interface ImageState {
  images: Map<string, ImageWithData>;
  selectedImages: Set<string>;
  newImagesTrigger: boolean;
  allAreUpscaled: boolean;
  allAreUploaded: boolean;
}

const initialState: ImageState = {
  images: new Map<string, ImageWithData>(),
  selectedImages: new Set<string>(),
  newImagesTrigger: false,
  allAreUpscaled: false,
  allAreUploaded: false,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ImageWithData[]>) => {
      state.selectedImages.clear();
      state.images.clear();
      for (const item of action.payload) {
        state.images.set(item.name, item);
      }
      state.newImagesTrigger = !state.newImagesTrigger;
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedImages.has(action.payload)) {
        state.selectedImages.delete(action.payload);
      } else {
        state.selectedImages.add(action.payload);
      }
    },
    setUpscaledUri: (state, action: PayloadAction<UploadEvent>) => {
      const image = state.images.get(action.payload.fileName);
      if (image) {
        image.upscaledUri = action.payload.filePath;
        image.uploadedToFtp = false;
      }
    },
    setIsUploadedToFtp: (state, action: PayloadAction<UploadEvent>) => {
      const image = state.images.get(action.payload.fileName);
      if (image) {
        image.uploadedToFtp = true;
      }
    },
    resetIsUploadedToFtp: (state, action: PayloadAction<string>) => {
      const image = state.images.get(action.payload);
      if (image) {
        image.uploadedToFtp = false;
      }
    },
    setAllAreUpscaled: (state, action: PayloadAction<boolean>) => {
      state.allAreUpscaled = action.payload;
    },
    setAllAreUploaded: (state, action: PayloadAction<boolean>) => {
      state.allAreUploaded = action.payload;
    },
  },
});

export const {
  setImages,
  setUpscaledUri,
  setIsUploadedToFtp,
  resetIsUploadedToFtp,
  toggleSelection,
  setAllAreUpscaled,
  setAllAreUploaded,
} = imageSlice.actions;
export default imageSlice.reducer;
