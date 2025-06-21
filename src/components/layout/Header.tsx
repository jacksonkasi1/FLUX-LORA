
import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-[20px] border-b border-[#F5F5F7]/50">
      <div className="max-w-[425px] mx-auto px-5 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-6 h-6 bg-black rounded-sm transform rotate-12" />
            <h1 className="text-[24px] font-bold text-black tracking-tight">FLUX</h1>
          </button>
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
