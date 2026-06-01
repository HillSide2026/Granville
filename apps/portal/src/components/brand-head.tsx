import { useEffect } from 'react'

const BRAND_VERSION = '20260531'

const brandHead = {
  public: {
    title: 'Granville Finance',
    favicon: `/images/favicon-public.svg?v=${BRAND_VERSION}`,
    appleTouchIcon: `/images/apple-touch-icon-public.svg?v=${BRAND_VERSION}`,
    manifest: `/manifest-public.webmanifest?v=${BRAND_VERSION}`,
    themeColor: '#f8fafc',
  },
  portal: {
    title: 'Granville Payments Platform',
    favicon: `/images/favicon-portal.svg?v=${BRAND_VERSION}`,
    appleTouchIcon: `/images/apple-touch-icon-portal.svg?v=${BRAND_VERSION}`,
    manifest: `/manifest-portal.webmanifest?v=${BRAND_VERSION}`,
    themeColor: '#07111f',
  },
} as const

type BrandHeadProps = {
  state: keyof typeof brandHead
}

export function BrandHead({ state }: BrandHeadProps) {
  useEffect(() => {
    const config = brandHead[state]
    document.title = config.title
    setMetaContent('meta[name="title"]', config.title)
    setMetaContent('meta[property="og:title"]', config.title)
    setMetaContent('meta[property="twitter:title"]', config.title)
    setMetaContent('meta[name="theme-color"]', config.themeColor)
    setLinkHref('link[rel="icon"]', config.favicon)
    setLinkHref('link[rel="apple-touch-icon"]', config.appleTouchIcon)
    setLinkHref('link[rel="manifest"]', config.manifest)
  }, [state])

  return null
}

function setLinkHref(selector: string, href: string) {
  const link = document.head.querySelector<HTMLLinkElement>(selector)
  if (link) {
    link.href = href
  }
}

function setMetaContent(selector: string, content: string) {
  const meta = document.head.querySelector<HTMLMetaElement>(selector)
  if (meta) {
    meta.content = content
  }
}
