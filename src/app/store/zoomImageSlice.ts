import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ZoomImageState {
  backgroundImage: string;
  isHovered: boolean;
  backgroundPosition: string;
  zoomLevel: number;
}

const initialState: ZoomImageState = {
  backgroundImage: '',
  isHovered: false,
  backgroundPosition: '0% 0%',
  zoomLevel: 1,
};

const zoomImageSlice = createSlice({
  name: 'zoomImage',
  initialState,
  reducers: {
    setBackgroundImage: (state, action: PayloadAction<string>) => {
      state.backgroundImage = action.payload;
    },
    setIsHovered: (state, action: PayloadAction<boolean>) => {
      state.isHovered = action.payload;
    },
    setBackgroundPosition: (state, action: PayloadAction<string>) => {
      state.backgroundPosition = action.payload;
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = action.payload;
    },
  },
});

export const {
  setBackgroundImage,
  setIsHovered,
  setBackgroundPosition,
  setZoomLevel,
} = zoomImageSlice.actions;

export default zoomImageSlice.reducer;
