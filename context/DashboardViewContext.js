"use client";

import { createContext, useContext } from "react";

export const DashboardViewContext = createContext(null);

export const useDashboardView = () => useContext(DashboardViewContext);
