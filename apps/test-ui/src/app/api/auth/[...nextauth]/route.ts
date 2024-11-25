// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

import { handlers } from "@sophys-web/auth";

// const AUTH_COOKIE_PATTERN = /authjs\.session-token=(?:[^;]+)/;

export const { GET, POST } = handlers;
