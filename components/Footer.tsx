import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-shen-gold to-transparent opacity-30 mb-2"></div>
        <a 
          href="https://t.me/shervini" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-transparent bg-clip-text bg-gradient-to-r from-white via-shen-gold to-white font-brand text-xs sm:text-sm tracking-widest hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
        >
          ✨ Exclusive SHΞN™ Made - Santa Edition ✨
        </a>
      </div>
    </div>
  );
};

export default Footer;