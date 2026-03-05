// hooks/redux.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";

// Use these instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);