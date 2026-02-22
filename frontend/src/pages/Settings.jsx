import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Phone, LogOut, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';

const Settings = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleVerifyNumber = () => {
        if (!user || user.smsVerified) return;

        const userIdPart = user.id ? user.id.slice(-5) : '';
        const message = encodeURIComponent(`Olá, eu sou ${user.name}, quero validar meu telefone. Meu código é ${userIdPart}.`);
        window.open(`https://wa.me/5511967665711?text=${message}`, '_blank');
    };

    const handleUpdateApp = async () => {
        setIsUpdating(true);
        try {
            if (refreshUser) {
                await refreshUser();
            }
            window.location.reload(true);
        } catch (error) {
            console.error('Erro ao atualizar app:', error);
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="px-4 py-4 pb-24">
                {/* Cabeçalho */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
                </div>

                {/* Configurações - Estilo iOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Verificar Número */}
                    <button
                        onClick={handleVerifyNumber}
                        className="w-full flex items-center justify-between px-4 py-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Phone size={18} className="text-blue-600" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-gray-900 font-medium text-base">Verificar meu número</span>
                                {user?.smsVerified ? (
                                    <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                        <CheckCircle2 size={12} /> Verificado
                                    </span>
                                ) : (
                                    <span className="text-xs text-orange-500 mt-0.5">Não verificado</span>
                                )}
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    {/* Atualizar Aplicativo */}
                    <button
                        onClick={handleUpdateApp}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-between px-4 py-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-100 disabled:opacity-70"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <RefreshCw size={18} className={`text-blue-600 ${isUpdating ? 'animate-spin' : ''}`} />
                            </div>
                            <span className="text-gray-900 font-medium text-base">
                                {isUpdating ? 'Atualizando...' : 'Atualizar aplicativo'}
                            </span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    {/* Sair da Conta */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-between px-4 py-4 bg-white active:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                <LogOut size={18} className="text-red-600" />
                            </div>
                            <span className="text-red-600 font-medium text-base">Sair da minha conta</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Settings;
