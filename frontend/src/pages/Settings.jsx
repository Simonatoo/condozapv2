import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Phone, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);

    const handleVerifyNumber = () => {
        // Placeholder para o fluxo de verificação
        alert("Em breve: Fluxo de verificação de número.");
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
