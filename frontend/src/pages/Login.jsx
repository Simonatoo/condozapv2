import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, Phone, Home } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
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
        if (!apartment) {
            setError('Por favor, informe o seu apartamento');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await googleLogin(googleToken, apartment);
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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Home className="text-white" size={24} />
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Quase lá, {name.split(' ')[0]}!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Para concluir seu cadastro, informe o seu apartamento.
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleGoogleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="apartment-google" className="block text-sm font-medium leading-6 text-gray-900">
                                Seu Apartamento
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Home className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="apartment-google"
                                    name="apartment"
                                    type="text"
                                    required
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    placeholder="Ex: Apto 101"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center items-center rounded-xl bg-blue-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Finalizando...' : 'Concluir cadastro'}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowGoogleApartment(false)}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                            >
                                Voltar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Lock className="text-white" size={24} />
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    {isRegister ? 'Crie sua conta' : 'Bem-vindo de volta'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    {isRegister ? 'Preencha os dados abaixo para começar' : 'Entre para acessar a loja do condomínio'}
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    {isRegister && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                    Nome completo
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required={isRegister}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium leading-6 text-gray-900">
                                    Telefone
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="telefone"
                                        name="telefone"
                                        type="tel"
                                        required={isRegister}
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="apartment" className="block text-sm font-medium leading-6 text-gray-900">
                                    Apartamento
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Home className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="apartment"
                                        name="apartment"
                                        type="text"
                                        required={isRegister}
                                        value={apartment}
                                        onChange={(e) => setApartment(e.target.value)}
                                        className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="Apto 101"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Endereço de email
                        </label>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="nome@exemplo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Senha
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center items-center rounded-xl bg-blue-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (isRegister ? 'Criando conta...' : 'Entrando...') : (isRegister ? 'Criar conta' : 'Entrar')}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm font-medium leading-6">
                                <span className="bg-gray-50 px-6 text-gray-400">ou</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setError('Login com Google falhou');
                                }}
                                useOneTap
                                theme="outline"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                        >
                            {isRegister ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
