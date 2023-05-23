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
    setTags: (state, action: PayloadAction<string[] | undefined>) => {
      state.tags = action.payload ?? [];
    },
    removeTagAtIndex: (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter((_, i) => i !== action.payload);
    },
    prependTag: (state, action: PayloadAction<string>) => {
      const set = new Set(state.tags);
      set.delete(action.payload); // a new tag should be placed to the top so delete the old one if it exists
      state.tags.unshift(action.payload);
    },
  },
});

export const { setTags, removeTagAtIndex, prependTag } = tagSlice.actions;
export default tagSlice.reducer;
