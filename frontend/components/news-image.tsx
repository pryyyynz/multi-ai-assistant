"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// Client Component for the Image with error handling
interface NewsImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function NewsImage({ src, alt, className }: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  
  // Reset the image source if src prop changes
  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="64px"
      className={className}
      onError={() => setImgSrc("/placeholder.svg?height=64&width=64")}
    />
  )
}