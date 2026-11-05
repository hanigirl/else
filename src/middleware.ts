import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Handle Figma Flow course page metadata override
  if (url.pathname === '/courses/figma-flow') {
    const FRAMER_ORIGIN = process.env.FRAMER_ORIGIN || "https://adored-look-881750.framer.app"
    
    try {
      // Fetch the original Framer page
      const framerResponse = await fetch(`${FRAMER_ORIGIN}/courses/figma-flow`, {
        headers: {
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        },
      })
      
      if (!framerResponse.ok) {
        return NextResponse.next()
      }
      
      let html = await framerResponse.text()
      
      // Replace the title and meta tags
      // Update <title> tag
      html = html.replace(
        /<title>.*?<\/title>/i,
        '<title>Figma Flow — ELSE</title>'
      )
      
      // Update og:title meta tag
      html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        '<meta property="og:title" content="Figma Flow — ELSE">'
      )
      
      // Update twitter:title meta tag
      html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        '<meta name="twitter:title" content="Figma Flow — ELSE">'
      )
      
      // Return modified HTML
      return new NextResponse(html, {
        status: framerResponse.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      })
    } catch (error) {
      console.error('Error proxying Figma Flow page:', error)
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/courses/figma-flow',
}
