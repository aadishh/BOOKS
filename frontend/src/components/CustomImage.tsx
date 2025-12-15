'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function CustomImage({ 
  src, 
  alt, 
  width = 300, 
  height = 400, 
  className = '',
  priority = false 
}: CustomImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setImgSrc('/images/placeholder.jpg')}
    />
  );
}
