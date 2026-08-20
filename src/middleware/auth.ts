import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, getTokenFromRequest, JWTPayload } from "@/utils/auth";
import { connectDB } from "@/utils/db";
import User from "@/models/User";

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload & { _id: string };
}

export const authMiddleware = async (
  request: NextRequest
): Promise<{ user: JWTPayload & { _id: string } } | NextResponse> => {
  try {
    await connectDB();

    const token = await getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized request", errors: [], data: null },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select("-password -refreshToken");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized request", errors: [], data: null },
        { status: 401 }
      );
    }

    return { user: { ...decoded, _id: user._id.toString() } };
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Invalid token", errors: [], data: null },
      { status: 401 }
    );
  }
};

export const withAuth = (
  handler: (request: AuthenticatedRequest, context?: { params: Promise<any> }) => Promise<NextResponse>
) => {
  return async (request: NextRequest, context?: { params: Promise<any> }) => {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    return handler(authenticatedRequest, context);
  };
};