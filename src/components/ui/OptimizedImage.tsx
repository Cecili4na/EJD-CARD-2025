import { useState, useEffect } from 'react';

type OptimizedContext = 'lojinha' | 'lanchonete' | 'sapatinho'

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  context: OptimizedContext;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className, context }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const getDefaultImage = (): string => {
    const svg = context === 'lanchonete' 
      ? `<svg>...</svg>` // your lanchonete SVG
      : context === 'sapatinho'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="defaultSapatinho1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fbcfe8;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#f472b6;stop-opacity:0.4" />
              </linearGradient>
              <linearGradient id="defaultSapatinho2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="400" height="400" fill="url(#defaultSapatinho1)"/>
            <circle cx="200" cy="200" r="130" fill="white" opacity="0.35"/>
            <g transform="translate(200,210) rotate(-10)">
              <path d="M -90 30 C -60 -10, -20 -30, 40 -20 C 80 -10, 110 20, 90 50 C 60 90, 0 120, -40 110 C -80 100, -110 70, -90 30 Z" fill="url(#defaultSapatinho2)"/>
              <path d="M 10 -40 C 20 -30, 40 -20, 50 -10 C 60 0, 40 10, 20 5 C 0 0, -20 -20, 10 -40 Z" fill="#fdf2f8"/>
              <circle cx="35" cy="-5" r="12" fill="#fce7f3"/>
            </g>
            <text x="200" y="320" font-size="18" text-anchor="middle" fill="#db2777" font-family="Arial, sans-serif" font-weight="600">
              Item especial do Sapatinho
            </text>
            <text x="200" y="345" font-size="14" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif">
              Imagem não disponível
            </text>
          </svg>`
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