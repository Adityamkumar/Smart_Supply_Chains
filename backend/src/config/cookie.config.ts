import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true, // Always true as requested, though usually isProduction in dev
  sameSite: "none",
  maxAge: SEVEN_DAYS,
  path: "/",
};

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};
