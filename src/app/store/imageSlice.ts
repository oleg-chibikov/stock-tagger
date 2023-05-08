import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageWithData } from '../helpers/fileHelper';

interface ImageState {
  images: ImageWithData[];
  selectedImages: ImageWithData[];
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
  },
});

export const { setImages, setSelectedImages } = imageSlice.actions;
export default imageSlice.reducer;
