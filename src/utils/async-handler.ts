import { NextRequest, NextResponse } from "next/server";
import ApiError from "./api-error";

type RequestHandler = (
  req: NextRequest,
  context?: { params: Promise<any> }
) => Promise<NextResponse | Response>;

const asyncHandler = (requestHandler: RequestHandler) => {
  return async (req: NextRequest, context?: { params: Promise<any> }) => {
    try {
      const result = await requestHandler(req, context);
      return result;
    } catch (error: any) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            errors: error.errors,
            data: error.data,
          },
          { status: error.statusCode }
        );
      }

      console.error("Unhandled error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Internal Server Error",
          errors: [],
          data: null,
        },
        { status: 500 }
      );
    }
  };
};

export default asyncHandler;