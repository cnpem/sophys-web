// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

import { handlers } from "@repo/auth";

// const AUTH_COOKIE_PATTERN = /authjs\.session-token=(?:[^;]+)/;

export const { GET, POST } = handlers;
