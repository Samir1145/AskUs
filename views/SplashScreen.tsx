import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000); // 3 seconds duration
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white relative overflow-hidden animate-in fade-in duration-500">
      
      <div className="flex flex-col items-center z-10 animate-in zoom-in duration-700 ease-out p-8">
        {/* Logo Image */}
        <img 
          src="https://i.ibb.co/NdgtQJbc/tacotribelogo.png" 
          alt="Taco Tribe Logo" 
          className="w-full max-w-[320px] h-auto object-contain drop-shadow-sm"
        />
      </div>
    </div>
  );
};

export default SplashScreen;