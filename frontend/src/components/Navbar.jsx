import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, Package, Settings as SettingsIcon, Building2, BellRing, Bell } from 'lucide-react';
import logoText from '../../public/assets/logo-color.svg';

const Navbar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null; // Don't show nav on login screen if logic allows, though PrivateRoute handles most.

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Início', icon: Home },
        { path: '/my-products', label: 'Meus Anúncios', icon: Package },
        { path: '/my-condo', label: 'Impacto', icon: Building2 },
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    return (
        <>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 h-14 flex items-center justify-center px-4">
                {user && (
                    <div className='flex items-center gap-4 absolute right-4'>
                        <Bell size={22} className='text-neutral-400' />
                        <div className='border border-gray-200 bg-gray-100 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center'>
                            {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <User size={18} />}
                        </div>
                    </div>
                )}
                {/* {user && user.points && (
                    <span className="text-sm font-medium text-gray-700">CondoPoints: {user.points}</span>
                )} */}
                <img src={logoText} alt="Logo" width={44} className="absolute left-4" />
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 h-[68px] flex justify-around items-center z-10 pb-safe">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <div className='w-full h-full flex flex-col items-center justify-center'>
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {/* Linha indicadora superior - Estilo Amazon */}
                                {active && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b"></div>
                                )}

                                <div className={`flex items-center justify-center transition-transform duration-200 mt-1`}>
                                    <Icon size={24} strokeWidth={1.5} />
                                </div>
                                <span className='text-[10px] mt-1 font-bold'>{item.label}</span>
                            </button>
                        </div>
                    );
                })}

            </div>

            {/* Spacer for Bottom Nav */}
            <div className="h-14"></div>
        </>
    );
};

export default Navbar;
