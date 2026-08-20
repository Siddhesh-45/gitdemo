import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
}

const signOptions: SignOptions = {
  algorithm: "HS256",
};

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    ...signOptions,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || "15m",
  } as SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    ...signOptions,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JWTPayload;
};

export const getTokenFromRequest = async (request: Request): Promise<string | null> => {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("accessToken")?.value;

  const authHeader = request.headers.get("Authorization");
  const tokenFromHeader = authHeader?.replace("Bearer ", "");

  return tokenFromCookie || tokenFromHeader || null;
};

export const setAuthCookies = async (
  accessToken: string,
  refreshToken: string
) => {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};