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
      ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#fef9c3"/>
        <circle cx="200" cy="180" r="110" fill="#fde047" opacity="0.6"/>

        <!-- Copo de refrigerante -->
        <g transform="translate(140,120)">
          <rect x="0" y="0" width="40" height="70" rx="5" fill="#60a5fa" stroke="#1e3a8a" stroke-width="3"/>
          <rect x="8" y="-12" width="24" height="12" rx="3" fill="#1e3a8a"/>
          <rect x="17" y="-25" width="6" height="15" fill="#1e3a8a"/>
          <circle cx="20" cy="35" r="5" fill="#bfdbfe" opacity="0.8"/>
        </g>

        <!-- Hambúrguer -->
        <g transform="translate(210,200)">
          <ellipse cx="0" cy="35" rx="65" ry="18" fill="#78350f"/>
          <rect x="-65" y="10" width="130" height="20" fill="#22c55e"/>
          <ellipse cx="0" cy="5" rx="65" ry="18" fill="#facc15"/>
          <ellipse cx="0" cy="-10" rx="65" ry="18" fill="#fcd34d"/>
        </g>

        <!-- Batata -->
        <g transform="translate(280,150) rotate(10)">
          <rect x="-20" y="0" width="40" height="50" rx="5" fill="#f87171"/>
          <rect x="-12" y="-20" width="24" height="20" fill="#fbbf24" rx="2"/>
          <rect x="-10" y="-25" width="4" height="25" fill="#fde68a"/>
          <rect x="0" y="-25" width="4" height="25" fill="#fde68a"/>
          <rect x="10" y="-25" width="4" height="25" fill="#fde68a"/>
        </g>

        <text x="200" y="320" font-size="22" text-anchor="middle" fill="#78350f" font-family="Arial" font-weight="bold">
          Item sem imagem
        </text>
        <text x="200" y="345" font-size="16" text-anchor="middle" fill="#92400e" font-family="Arial">
          Cardápio da Lanchonete
        </text>
      </svg>`
      : context === 'sapatinho'
        ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="gradSapatinho1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fbcfe8;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#f472b6;stop-opacity:0.4" />
          </linearGradient>
          <linearGradient id="gradSapatinho2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="400" height="400" fill="url(#gradSapatinho1)"/>

        <!-- Sapato vetorial -->
        <g transform="translate(200,200) rotate(-10)">
          <path d="M -90 30 C -60 -10, -20 -30, 40 -20 C 80 -10, 110 20, 90 50 C 60 90, 0 120, -40 110 C -80 100, -110 70, -90 30 Z"
                fill="url(#gradSapatinho2)" stroke="#be185d" stroke-width="3"/>
          <path d="M -50 0 L 70 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
          <circle cx="-40" cy="0" r="3" fill="#fff"/>
          <circle cx="-25" cy="2" r="3" fill="#fff"/>
          <circle cx="-10" cy="4" r="3" fill="#fff"/>
          <circle cx="5" cy="6" r="3" fill="#fff"/>
          <circle cx="20" cy="8" r="3" fill="#fff"/>
          <circle cx="35" cy="9" r="3" fill="#fff"/>
        </g>

        <text x="200" y="320" font-size="18" text-anchor="middle" fill="#db2777" font-family="Arial" font-weight="600">
          Item especial do Sapatinho
        </text>
        <text x="200" y="345" font-size="14" text-anchor="middle" fill="#6b7280" font-family="Arial">
          Imagem não disponível
        </text>
      </svg>`
        : `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f0f9ff"/>
        <circle cx="200" cy="170" r="110" fill="#38bdf8" opacity="0.25"/>

        <!-- Sacola -->
        <g transform="translate(200,180)">
          <rect x="-45" y="-30" width="90" height="100" rx="10" fill="#93c5fd" stroke="#0369a1" stroke-width="3"/>
          <path d="M -25 -30 C -25 -60, 25 -60, 25 -30" stroke="#0369a1" stroke-width="3" fill="none"/>
          <circle cx="-15" cy="-35" r="4" fill="#0284c7"/>
          <circle cx="15" cy="-35" r="4" fill="#0284c7"/>
          <rect x="-45" y="50" width="90" height="10" fill="#60a5fa"/>
        </g>

        <text x="200" y="320" font-size="20" text-anchor="middle" fill="#0369a1" font-family="Arial" font-weight="bold">
          Produto sem imagem
        </text>
        <text x="200" y="345" font-size="14" text-anchor="middle" fill="#0284c7" font-family="Arial">
          Lojinha
        </text>
      </svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    if (!src) {
      setImageUrl(getDefaultImage());
      setIsLoading(false);
      return;
    }

    // Usar a URL diretamente - deixar o navegador lidar com o carregamento
    setImageUrl(src);
    setIsLoading(false);
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
          // Só trocar para fallback se não for já o fallback
          if (target.src !== getDefaultImage()) {
            target.onerror = null;
            target.src = getDefaultImage();
          }
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default OptimizedImage;