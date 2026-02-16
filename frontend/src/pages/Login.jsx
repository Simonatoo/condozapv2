import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, Phone, Home, X, ChevronLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../assets/Logo-color.svg';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [telefone, setTelefone] = useState('');
    const [apartment, setApartment] = useState('');

    const { login, register, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showGoogleApartment, setShowGoogleApartment] = useState(false);
    const [googleToken, setGoogleToken] = useState(null);

    const handleEmailLoginClick = () => {
        setIsRegister(false);
        setShowEmailModal(true);
        setError('');
    };

    const handleCreateAccountClick = () => {
        setIsRegister(true);
        setShowEmailModal(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                await register({ name, email, password, telefone, apartment });
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.needsRegistration) {
                setGoogleToken(credentialResponse.credential);
                setShowGoogleApartment(true);
                setName(result.name || '');
                setEmail(result.email || '');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setError('Falha ao entrar com Google');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async (e) => {
        e.preventDefault();
        if (!apartment || !telefone) {
            setError('Por favor, informe todos os campos obrigatórios');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await googleLogin(googleToken, apartment, telefone);
            navigate('/');
        } catch (err) {
            console.error("Google Registration Error:", err);
            setError('Falha ao concluir cadastro com Google');
        } finally {
            setLoading(false);
        }
    };

    if (showGoogleApartment) {
        return (
            <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6">
                            <Home className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Quase lá, {name.split(' ')[0]}!
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Para concluir seu cadastro, informe seus dados de contato.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleGoogleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Apartamento e Bloco</label>
                            <div className="relative">
                                <Home className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Ex: Apto 101 A"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center bg-blue-600 text-white rounded-full py-4 font-bold text-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-6"
                        >
                            {loading ? 'Finalizando...' : 'Concluir cadastro'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowGoogleApartment(false)}
                            className="w-full text-center text-gray-500 font-medium py-2"
                        >
                            Voltar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
            {/* Landing View */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 pt-10 pb-40 text-center z-0 relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-50 rounded-full blur-3xl opacity-60 z-[-1]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-50 rounded-full blur-3xl opacity-60 z-[-1]" />

                <div className="mb-4">
                    <img src={Logo} alt="CondoZap" className="h-32 w-auto transform rotate-3 transition-transform hover:rotate-6 drop-shadow-2xl" />
                </div>

                <h1 className="text-4xl font-bold text-[#005E9E] mb-3 tracking-tight">CondoZap</h1>
                <p className="text-md text-gray-500 font-medium max-w-[300px] leading-relaxed">
                    Sua comunidade, conectada. Venda, compre e interaja com seus vizinhos.
                </p>
            </div>

            {/* Bottom Actions Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-white/80 backdrop-blur-sm border-t border-gray-100 z-10 flex flex-col gap-3">
                {/* Google Button Wrapper to ensure full width perception */}
                <div className="w-full [&>div]:w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Login com Google falhou')}
                        useOneTap
                        theme="filled_white"
                        shape="circle"
                        text="signin_with"
                        width="100%"
                        locale="pt_BR"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleEmailLoginClick}
                        className="flex w-full justify-center items-center bg-[#005E9E] text-white font-regular py-2 px-6 rounded-full border border-blue-600/30 hover:bg-gray-200 transition-colors active:scale-[0.98]"
                    >
                        <Mail size={18} className="mr-2" />
                        Entrar com e-mail
                    </button>
                </div>

                <button
                    onClick={handleCreateAccountClick}
                    className="w-full text-[#005E9E] font-medium py-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                    Ainda não tenho uma conta
                </button>
            </div>

            {/* Full Screen Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-white z-50 animate-in slide-in-from-bottom duration-300 flex flex-col">
                    {/* Header */}
                    <div className="p-4 flex items-center">
                        <button
                            onClick={() => setShowEmailModal(false)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft size={28} className="text-gray-900" />
                        </button>
                    </div>

                    <div className="flex-1 px-8 pt-4 pb-8 overflow-y-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {isRegister ? 'Criar conta' : 'Bem-vindo de volta'}
                            </h2>
                            <p className="text-gray-500 text-lg">
                                {isRegister ? 'Preencha os dados abaixo para começar.' : 'Digite seu e-mail e senha para entrar.'}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl text-center font-medium">
                                    {error}
                                </div>
                            )}

                            {isRegister && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Nome completo</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required={isRegister}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                placeholder="Seu nome"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                required={isRegister}
                                                value={telefone}
                                                onChange={(e) => setTelefone(e.target.value)}
                                                className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Apartamento</label>
                                        <div className="relative">
                                            <Home className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required={isRegister}
                                                value={apartment}
                                                onChange={(e) => setApartment(e.target.value)}
                                                className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                placeholder="Apto 101"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="nome@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3.5 pl-11 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center bg-blue-600 text-white rounded-full py-4 font-bold text-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                >
                                    {loading ? 'Carregando...' : (isRegister ? 'Criar conta' : 'Entrar')}
                                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 text-center border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-blue-600 font-semibold py-2 px-4 rounded-full hover:bg-blue-50 transition-colors"
                        >
                            {isRegister ? 'Já tenho uma conta' : 'Não tenho conta ainda'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
