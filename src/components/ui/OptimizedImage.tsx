import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  context: 'lojinha' | 'lanchonete';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className, context }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const getDefaultImage = (): string => {
    const svg = context === 'lanchonete' 
      ? `<svg>...</svg>` // your lanchonete SVG
      : `<svg>...</svg>` // your lojinha SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setImageUrl(getDefaultImage());
        setIsLoading(false);
        return;
      }

      try {
        // Add cache busting and optimization parameters
        const optimizedUrl = new URL(src);
        optimizedUrl.searchParams.set('width', '400');
        optimizedUrl.searchParams.set('quality', '80');
        optimizedUrl.searchParams.set('v', Date.now().toString());

        const response = await fetch(optimizedUrl.toString());
        if (!response.ok) throw new Error('Image load failed');

        setImageUrl(optimizedUrl.toString());
      } catch (error) {
        console.error('Image load error:', error);
        setImageUrl(getDefaultImage());
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = getDefaultImage();
        }}
      />
    </div>
  );
};

export default OptimizedImage;