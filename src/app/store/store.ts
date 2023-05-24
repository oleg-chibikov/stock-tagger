import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import imageReducer from './imageSlice';
import tagReducer from './tagSlice';
import zoomImageReducer from './zoomImageSlice';

enableMapSet();
const store = configureStore({
  reducer: {
    image: imageReducer,
    tag: tagReducer,
    zoomImage: zoomImageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // The application stores a Set to improve its performance
});

type RootState = ReturnType<typeof store.getState>;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type { RootState };
export { store, useAppSelector };
