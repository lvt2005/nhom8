import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 👇 Sửa dòng này: Thêm chữ 'default' và có thể bỏ tên hàm hoặc giữ nguyên
export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (token) {
    return NextResponse.next()
  } else {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    "/chat/:path*",
  ]
}