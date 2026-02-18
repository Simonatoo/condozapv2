import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, Package } from 'lucide-react';

const Navbar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null; // Don't show nav on login screen if logic allows, though PrivateRoute handles most.

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 h-14 flex items-center justify-center px-4">
                {user && (
                    <div className="absolute left-4">
                        <div className='border border-gray-200 bg-gray-100 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center'>
                            {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full" /> : <User size={18} />}
                        </div>
                    </div>
                )}
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">CondoZap</h1>
                <div className="absolute right-4">
                    <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-10 pb-1 safe-area-bottom">
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Início</span>
                </button>

                <button
                    onClick={() => navigate('/my-products')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/my-products') ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <Package size={24} strokeWidth={isActive('/my-products') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Meus Produtos</span>
                </button>

                {/* <button
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 cursor-not-allowed`}
                // Placeholder for Profile or other tabs
                >
                    <User size={24} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Perfil</span>
                </button> */}
            </div>

            {/* Spacer for Bottom Nav */}
            <div className="h-16"></div>
        </>
    );
};

export default Navbar;
