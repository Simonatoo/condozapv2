import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { MapPin, Frown, RefreshCcw, User, Check } from 'lucide-react';
import Modal from '../components/modal/Modal';
import ScoreAnimation from '../components/ScoreAnimation';
import BADGE_MAP from '../constants/badgeMap';
import Verified from '../components/Verified';

const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-3 flex flex-col flex-1">
            <div className="mb-2 h-6 bg-gray-200 rounded w-1/2" />
            <div className="mb-2 h-4 bg-gray-200 rounded w-full" />
            <div className="mb-4 h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
    </div>
);

const Home = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const observer = useRef();

    // Reward Modal States
    const [rewardQueue, setRewardQueue] = useState([]);
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

    // Current reward to show
    const currentRewardId = rewardQueue[0];
    const rewardInfo = currentRewardId ? BADGE_MAP[currentRewardId] : null;

    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0) {
            setActiveImage(selectedProduct.images[0]);
        } else {
            setActiveImage('');
        }
    }, [selectedProduct]);

    // Check for unseen badges
    useEffect(() => {
        if (user && user.badges && Array.isArray(user.badges)) {
            const checked = user.checkedBadges || [];
            const unseen = user.badges.filter(b => b && b !== '' && !checked.includes(b));
            if (unseen.length > 0) {
                setRewardQueue(unseen);
                setIsRewardModalOpen(true);
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Only full screen loading on initial mount if wanted, 
                // but here we want to show skeletons in the grid.
                // So we can let loading be true, but change how we render it.
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products?status=enabled&page=1&limit=10'),
                    api.get('/categories')
                ]);
                setProducts(productsRes.data);
                setHasMore(productsRes.data.length === 10);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (page === 1) return; // Handled by initial load or category change

        const fetchMoreProducts = async () => {
            setLoadingMore(true);
            try {
                let url = `/products?status=enabled&page=${page}&limit=10`;
                if (selectedCategory) url += `&category=${selectedCategory}`;
                const res = await api.get(url);
                setProducts(prev => [...prev, ...res.data]);
                setHasMore(res.data.length === 10);
            } catch (err) {
                console.error('Error fetching more products:', err);
            } finally {
                setLoadingMore(false);
            }
        };

        fetchMoreProducts();
    }, [page]);

    const handleCategoryClick = async (categoryId) => {
        setLoading(true); // Start loading
        setPage(1); // Reset page

        const newCategoryId = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(newCategoryId);

        try {
            let url = `/products?status=enabled&page=1&limit=10`;
            if (newCategoryId) url += `&category=${newCategoryId}`;
            const res = await api.get(url);
            setProducts(res.data);
            setHasMore(res.data.length === 10);
        } catch (err) {
            console.error('Error filtering products:', err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleBadgeClick = (badge) => {
        const badgeInfo = BADGE_MAP[badge]
        setSelectedBadge(badgeInfo)
        setIsBadgeModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />


            {/* Banner */}
            <div className='bg-[#E12D53] text-center py-2'>
                <h3 className='text-white text-sm font-bold'>MAPP BARRA FUNDA - Perdizes</h3>
            </div>

            <main className="px-3 py-3 pb-24">
                {/* Welcome */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-sm text-gray-600 mt-1">Que bom ter você por aqui. Veja o que seus vizinhos prepararam para hoje.</p>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryClick(cat._id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm border font-medium transition-all ${selectedCategory === cat._id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white text-gray-600 border-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Feed Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Últimos lançamentos</h2>
                </div>

                {/* Product Feed Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {loading ? (
                        // Show Skeletons
                        Array.from({ length: 4 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))
                    ) : (
                        // Show Products
                        <>
                            {products.map((product, index) => {
                                const isLastProduct = products.length === index + 1;
                                return (
                                    <div
                                        key={product._id}
                                        ref={isLastProduct ? lastProductElementRef : null}
                                        onClick={() => setSelectedProduct(product)}
                                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden active:opacity-90 transition-opacity cursor-pointer flex flex-col"
                                    >
                                        {/* Image */}
                                        <div className="h-50 overflow-hidden bg-gray-100 flex items-center justify-center text-gray-300">
                                            {product.images.length > 0 && (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>

                                        <div className="p-3 flex flex-col flex-1">
                                            <div className="mb-1">
                                                <span className="text-xl font-normal text-gray-900">
                                                    R$ {Math.floor(product.value).toLocaleString('pt-BR')}
                                                </span>
                                                {(product.value % 1) > 0 && (
                                                    <span className="text-xs font-normal text-gray-900 align-top relative top-0.5">
                                                        ,{(product.value % 1).toFixed(2).substring(2)}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-sm text-gray-600 leading-snug line-clamp-2 mb-2 font-regular">
                                                {product.name}
                                            </h3>

                                            <div className="flex align-middle gap-1.5">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    Apto {product.user_id?.apartment || 'N/A'}
                                                </span>
                                                {product.user_id.smsVerified ? <Verified /> : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )
                    }
                    {loadingMore && (
                        Array.from({ length: 2 }).map((_, i) => (
                            <ProductSkeleton key={`loading-more-${i}`} />
                        ))
                    )}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-10 px-2 text-gray-400 flex flex-col items-center justify-center">
                        <Frown className="mb-2 text-gray-300" size={48} strokeWidth={2} />
                        <h3 className="text-lg font-medium text-gray-500">Nenhum resultado encontrado</h3>
                        <p className="text-sm">Parece que seus vizinhos ainda não anunciaram produtos ou serviços.</p>
                        <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-600/20 flex items-center gap-2"><RefreshCcw size={16} strokeWidth={2} />Recarregar página </button>
                    </div>
                )}
            </main>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-700 hover:bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto pb-24">
                        {/* Image Area */}
                        <div className="h-96 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                            <div className="flex flex-col items-center">
                                {activeImage ? (
                                    <img src={activeImage} alt={selectedProduct.name} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400">Sem Imagem</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                            <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-gray-100">
                                {selectedProduct.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-600 opacity-100 ring-2 ring-blue-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="px-5 py-6">
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl font-medium text-gray-900 leading-tight mb-2 flex-1 mr-4">
                                    {selectedProduct.name}
                                </h1>
                            </div>

                            <div className="flex items-baseline mb-6">
                                <span className="text-3xl font-light text-gray-900 mr-2">
                                    R$ {Math.floor(selectedProduct.value).toLocaleString('pt-BR')}
                                </span>
                                <span className="text-lg font-normal text-gray-900 align-top relative top-[-6px]">
                                    ,{(selectedProduct.value % 1).toFixed(2).substring(2)}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 py-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 py-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Vendedor</h3>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 overflow-hidden relative">
                                        {selectedProduct.user_id?.photo ? <img src={selectedProduct.user_id.photo} alt="Photo" className='w-full h-full object-cover' /> : <User size={24} />}
                                    </div>

                                    <div>
                                        <div className='flex items-center gap-1.5'>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedProduct.user_id?.name || 'Usuário'}
                                            </p>
                                            {selectedProduct.user_id?.smsVerified ? <Verified /> : null}
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <MapPin size={12} className="mr-1" />
                                            Apto {selectedProduct.user_id?.apartment || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6 flex-wrap">
                                    {selectedProduct.user_id?.badges ? selectedProduct.user_id.badges.filter(b => BADGE_MAP[b]).map((badge, index) => (
                                        <div className="flex flex-col items-center gap-1 w-16 text-center">
                                            <span key={index}
                                                onClick={() => handleBadgeClick(badge)}
                                                className="cursor-pointer text-xl p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors w-12 h-12 flex items-center justify-center"
                                            >
                                                {BADGE_MAP[badge].icon}
                                            </span>
                                            <span className="text-xs text-gray-500">{BADGE_MAP[badge].title}</span>
                                        </div>
                                    )) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-8">
                        <button
                            onClick={() => {
                                if (!selectedProduct.user_id?.telefone) {
                                    alert('Telefone do vendedor não disponível.');
                                    return;
                                }
                                const cleanPhone = selectedProduct.user_id.telefone.replace(/\D/g, '');
                                const message = encodeURIComponent(`Olá! Encontrei seu produto ${selectedProduct.name} no Condozap e tenho interesse. Ele ainda está disponível?`);
                                window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-full font-medium text-md shadow-lg shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle mr-2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                            Chamar no WhatsApp
                        </button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isBadgeModalOpen}
                onClose={() => setIsBadgeModalOpen(false)}
                title={`${selectedBadge?.icon} ${selectedBadge?.title ?? "Empty title"}`}
                size="full"
            >
                <div className='flex flex-col items-center justify-center'>
                    <p className='text-center'>{selectedBadge?.desc ?? "Empty description"}</p>
                    {selectedBadge?.points ? <ScoreAnimation duration={1000} targetValue={selectedBadge.points} trigger={isBadgeModalOpen} /> : null}
                </div>
            </Modal>

            {/* Reward Modal Queue */}
            <Modal
                isOpen={isRewardModalOpen && !!rewardInfo}
                onClose={() => {
                    // Prevent closing randomly before checking them all 
                    // or allow closing? Let's just allow it and sync what was seen? 
                    // The user wants a forced acknowledge. Let's keep it open or sync on close.
                    setIsRewardModalOpen(false);
                }}
                title="Novo Selo Conquistado!"
                size="md"
            >
                {rewardInfo && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-6xl mb-4 bg-gray-50 border border-gray-100 w-24 h-24 flex items-center justify-center rounded-full shadow-sm">
                            {rewardInfo.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{rewardInfo.title}</h3>
                        <p className="text-gray-600 mb-2">
                            {rewardInfo.desc}
                        </p>

                        {rewardInfo.points && (
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Recompensa</span>
                                <ScoreAnimation duration={1500} targetValue={rewardInfo.points} trigger={currentRewardId} />
                            </div>
                        )}

                        <button
                            onClick={async () => {
                                const newQueue = rewardQueue.slice(1);
                                setRewardQueue(newQueue);

                                if (newQueue.length === 0) {
                                    setIsRewardModalOpen(false);
                                    // Trigger backend sync here using the full list we got on load
                                    const unseen = user.badges.filter(b => b && b !== '' && !(user.checkedBadges || []).includes(b));
                                    try {
                                        const response = await api.put('/users/me/sync-badges', { badgesToSync: unseen });
                                        // Update local context directly to avoid infinite re-render loop
                                        user.checkedBadges = response.data.checkedBadges;
                                        localStorage.setItem('user', JSON.stringify(user));
                                    } catch (err) {
                                        console.error("Failed to sync checked badges", err);
                                    }
                                }
                            }}
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
                        >
                            {rewardQueue.length > 1 ? 'Próxima Recompensa' : 'Continuar'}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Home;
