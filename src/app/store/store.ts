import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import imageReducer from './imageSlice';
import tagReducer from './tagSlice';

enableMapSet();
const store = configureStore({
  reducer: {
    image: imageReducer,
    tag: tagReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type { RootState };
export { store, useAppSelector };
