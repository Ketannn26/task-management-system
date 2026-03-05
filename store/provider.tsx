// store/provider.tsx
"use client"; // ← This must be a client component

import { Provider } from "react-redux";
import { store } from "./index";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}   