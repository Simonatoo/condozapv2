import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Building2, TrendingUp, Handshake, ShoppingBag } from 'lucide-react';

const AnimatedCurrency = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!value) {
            setDisplayValue(0);
            return;
        }

        // Começar do 0 dá muito mais palco para a desaceleração brilhar e ficar suave
        const startValue = 0;
        setDisplayValue(startValue);

        let startTime;
        const duration = 2500; // 2.5s duration para o freio arrastar de forma leve e premium

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // easeOutExpo: O clássico 'freio infinito' suave. Vai rápido no começo e rola muito devagarinho até parar.
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = startValue + (value - startValue) * easeOutProgress;

            setDisplayValue(currentVal);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);

    return <>{displayValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</>;
};

const MyCondo = () => {
    const [stats, setStats] = useState({
        activeTotal: 0,
        soldTotal: 0,
        categoriesRanking: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products/stats/condominium')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="px-4 py-4 pb-24 space-y-4">
                {/* Cabeçalho */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Meu Condomínio</h1>
                    <p className="text-sm text-gray-500 mt-1">Impacto financeiro gerado no condomínio</p>
                </div>

                {/* Big Number 1: Economia Circular Total */}
                <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                        <TrendingUp size={20} />
                        <span className="font-medium text-sm">Economia Circular Total</span>
                    </div>
                    {loading ? (
                        <div className="h-10 bg-white/20 rounded animate-pulse w-3/4 mb-1"></div>
                    ) : (
                        <div className="text-3xl font-bold mb-1"><AnimatedCurrency value={stats.activeTotal} /></div>
                    )}
                    <p className="text-xs text-blue-100/80">em oportunidades circulando no nosso condomínio.</p>
                </div>

                {/* Big Number 2: Volume de Desapegos Realizados */}
                <div className="bg-linear-to-br from-green-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
                    <div className="flex items-center gap-2 mb-2 text-green-100">
                        <Handshake size={20} />
                        <span className="font-medium text-sm">Volume de Desapegos Realizados</span>
                    </div>
                    {loading ? (
                        <div className="h-10 bg-white/20 rounded animate-pulse w-3/4 mb-1"></div>
                    ) : (
                        <div className="text-3xl font-bold mb-1"><AnimatedCurrency value={stats.soldTotal} /></div>
                    )}
                    <p className="text-xs text-green-100/80">gerados em desapegos entre os vizinhos.</p>
                </div>

                {/* Ranking de Categorias */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-800">
                        <h2 className="font-bold text-lg">O que o pessoal mais desapega?</h2>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    ) : stats.categoriesRanking.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">Ainda não temos dados suficientes para o ranking.</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.categoriesRanking.map((cat, index) => (
                                <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                                    'bg-orange-100 text-orange-700'}`}>
                                            {index + 1}º
                                        </div>
                                        <span className="font-medium text-gray-800">{cat.name || 'Outros'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                                        {cat.count} {cat.count === 1 ? 'item' : 'itens'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyCondo;
