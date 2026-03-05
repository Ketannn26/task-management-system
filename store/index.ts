// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import columnReducer from "./columnSlice"; 

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    columns: columnReducer, 
  },
});

// These types are used when reading from or writing to the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
