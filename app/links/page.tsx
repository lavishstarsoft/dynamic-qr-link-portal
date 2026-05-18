'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305z" fill="#FF0000"/>
    <path d="M232.145 338.693V175.185l142.739 81.205-142.739 82.303z" fill="#FFFFFF"/>
  </svg>
);

const PlayStoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.20815 1.5835C2.79153 1.9585 2.5415 2.5835 2.5415 3.41683V20.5835C2.5415 21.4168 2.79153 22.0418 3.20815 22.4168L3.2915 22.5L14.7915 11.1668L14.75 11.0835L3.2915 1.5L3.20815 1.5835Z" fill="#00B0FF"/>
    <path d="M18.5416 14.8335L14.7915 11.1668L14.75 11.0835L18.5416 7.16683L18.6666 7.25016L22.25 9.29183C23.2916 9.87516 23.2916 10.8335 22.25 11.4168L18.6666 14.7502L18.5416 14.8335Z" fill="#FFEA00"/>
    <path d="M18.6666 14.7501L14.75 11.0835L3.20815 22.4168C3.79148 23.0001 4.7082 23.0835 5.75001 22.5001L18.6666 14.7501Z" fill="#F44336"/>
    <path d="M18.6666 7.25016L5.75001 0.0418281C4.7082 -0.541505 3.79148 -0.458172 3.20815 0.125161L14.75 11.0835L18.6666 7.25016Z" fill="#00E676"/>
  </svg>
);

function getFallbackDescription(type: string) {
  if (type === 'play') return 'Download for Android';
  if (type === 'ios') return 'Download for iOS';
  if (type === 'yt') return 'Watch our content';
  return 'Visit Link';
}

function LinksContent() {
  const [validLinks, setValidLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/links', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const processed = data.map((item: any) => {
            let icon, color;
            switch(item.type || item.t) {
              case 'play':
                icon = item.customImage ? <img src={item.customImage} className="w-8 h-8 mr-3 object-contain drop-shadow-sm" /> : <PlayStoreIcon className="w-8 h-8 mr-3 drop-shadow-sm" />;
                color = 'bg-white/95 backdrop-blur-md text-[#3D3934] hover:bg-white hover:-translate-y-1 shadow-lg hover:shadow-xl border border-white/50';
                break;
              case 'ios':
                icon = item.customImage ? <img src={item.customImage} className="w-8 h-8 mr-3 object-contain" /> : <AppleIcon className="w-8 h-8 mr-3 text-white" />;
                color = 'bg-[#111111]/95 backdrop-blur-md text-white hover:bg-black hover:-translate-y-1 shadow-lg hover:shadow-xl border border-white/10';
                break;
              case 'yt':
                icon = item.customImage ? <img src={item.customImage} className="w-8 h-8 mr-3 object-contain drop-shadow-sm" /> : <YouTubeIcon className="w-8 h-8 mr-3 drop-shadow-sm" />;
                color = 'bg-white/95 backdrop-blur-md text-[#3D3934] hover:bg-white hover:-translate-y-1 shadow-lg hover:shadow-xl border border-white/50';
                break;
              default:
                icon = item.customImage ? <img src={item.customImage} className="w-8 h-8 mr-3 object-contain" /> : <Globe className="w-8 h-8 mr-3 text-white" />;
                color = 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:-translate-y-1 shadow-lg hover:shadow-xl';
            }
            
            return {
              name: item.title || item.l || 'Website',
              url: item.url || item.u,
              icon,
              color,
              description: getFallbackDescription(item.type || item.t)
            };
          });
          setValidLinks(processed);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        console.error("Failed to parse link data", e);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#b00547] via-[#8f0134] to-[#600020] p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Fallback for previous version of the app URL payload is removed since we use local database now.

  if (validLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#b00547] via-[#8f0134] to-[#600020] p-4 text-center text-white/80">
        <h2 className="font-bold text-2xl mb-2 text-white">No Links Provided</h2>
        <p>Please generate a valid QR code to view the links.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#b00547] via-[#8f0134] to-[#600020] text-white p-6 sm:p-10 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle glow effect behind the card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-10 relative z-10">
          
          {/* NO.1 OTT CSS Logo */}
          <div className="flex flex-col items-center justify-center mb-8 text-white drop-shadow-md cursor-default select-none transform hover:scale-105 transition-transform duration-500">
            <div className="font-extrabold text-7xl leading-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>NO.1</div>
            <div className="flex items-center justify-center mt-1 text-5xl font-extrabold leading-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="relative flex items-center justify-center mr-0.5">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4.5"/>
                   <path d="M10 8.5L15 12L10 15.5V8.5Z" fill="currentColor"/>
                </svg>
              </div>
              TT
            </div>
          </div>
          
          <h1 className="font-bold text-3xl mb-2 text-white text-center tracking-tight">Welcome!</h1>
          <p className="text-white/80 text-center text-sm font-medium">Choose your platform below to continue.</p>
        </div>

        <div className="flex flex-col space-y-4 relative z-10">
          {validLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + (0.15 * index), ease: "easeOut" }}
              className={`flex items-center p-4 rounded-xl transition-all duration-300 group ${link.color}`}
            >
              <div className="p-1 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </div>
              <div className="ml-1 flex flex-col">
                <span className="font-bold text-[17px] tracking-wide">{link.name}</span>
                <span className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5 font-bold">{link.description}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-8 text-[10px] uppercase font-bold tracking-widest text-white/50"
      >
        Scan anywhere. Works indefinitely.
      </motion.div>
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#b00547] via-[#8f0134] to-[#600020] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <LinksContent />
    </Suspense>
  );
}
