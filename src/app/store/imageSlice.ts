import { UploadEvent } from '@dataTransferTypes/upload';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageWithData } from '../helpers/fileHelper';

interface ImageState {
  images: ImageWithData[];
  selectedImages: Set<string>;
}

const initialState: ImageState = {
  images: [],
  selectedImages: new Set<string>(),
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ImageWithData[]>) => {
      state.images = action.payload;
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
      }
    },
  },
});

export const { setImages, setUpscaledUri, toggleSelection } =
  imageSlice.actions;
export default imageSlice.reducer;
