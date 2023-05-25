import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ZoomImageState {
  backgroundImage?: ZoomImageInfo;
  isHovered: boolean;
  backgroundPosition: string;
  zoomLevel: number;
  isSelected: boolean;
}

const initialState: ZoomImageState = {
  backgroundImage: undefined,
  isHovered: false,
  backgroundPosition: '0% 0%',
  zoomLevel: 1,
  isSelected: false,
};

interface ZoomImageInfo {
  src: string;
  name: string;
}

const zoomImageSlice = createSlice({
  name: 'zoomImage',
  initialState,
  reducers: {
    setBackgroundImage: (state, action: PayloadAction<ZoomImageInfo>) => {
      state.backgroundImage = action.payload;
    },
    setIsHovered: (state, action: PayloadAction<boolean>) => {
      state.isHovered = action.payload;
    },
    setBackgroundPosition: (state, action: PayloadAction<string>) => {
      state.backgroundPosition = action.payload;
    },
    updateZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.min(
        Math.max(state.zoomLevel - action.payload * 0.01, 1),
        20
      );
    },
    toggleZoomImageSelection: (state) => {
      state.isSelected = !state.isSelected;
    },
    setZoomImageSelected: (state, action: PayloadAction<boolean>) => {
      state.isSelected = action.payload;
    },
  },
});

export const {
  setBackgroundImage,
  setIsHovered,
  setBackgroundPosition,
  updateZoomLevel,
  toggleZoomImageSelection,
  setZoomImageSelected,
} = zoomImageSlice.actions;

export default zoomImageSlice.reducer;
