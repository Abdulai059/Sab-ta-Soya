"use client";

import { createContext, useContext } from "react";

// Kept for backward compatibility — no longer drives view switching.
// Components that still import this will get an empty object safely.
export const DashboardViewContext = createContext(null);

export const useDashboardView = () => useContext(DashboardViewContext) ?? {};
