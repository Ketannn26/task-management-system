import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import columnReducer from "./columnSlice"; 

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    columns: columnReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
