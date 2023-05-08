import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TagState {
  tags: string[];
}

const initialState: TagState = {
  tags: [],
};

const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    removeTagAtIndex: (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter((_, i) => i !== action.payload);
    },
    prependTag: (state, action: PayloadAction<string>) => {
      state.tags.unshift(action.payload);
    },
  },
});

export const { setTags, removeTagAtIndex, prependTag } = tagSlice.actions;
export default tagSlice.reducer;
