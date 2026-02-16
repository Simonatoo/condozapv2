import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Tag, MapPin, DollarSign, Annoyed, Frown, RefreshCcw } from 'lucide-react';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0) {
            setActiveImage(selectedProduct.images[0]);
        } else {
            setActiveImage('');
        }
    }, [selectedProduct]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products?status=enabled');
                setProducts(res.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="px-3 py-3 pb-24">
                {/* Welcome */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-sm text-gray-600 mt-1">Que bom ter você por aqui. Veja o que seus vizinhos prepararam para hoje.</p>
                </div>

                {/* Feed Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Últimos lançamentos</h2>
                </div>

                {/* Product Feed Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {products.map((product) => (
                        <div
                            key={product._id}
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

                                <p className="text-xs text-gray-500 font-medium">
                                    Apto {product.user_id?.apartment || 'N/A'}
                                </p>
                            </div>
                        </div>
                    ))}
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
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img ? 'border-blue-600 opacity-100 ring-2 ring-blue-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
                                <h3 className="font-semibold text-gray-900 mb-2">Vendedor</h3>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                        {selectedProduct.user_id?.name ? selectedProduct.user_id.name.substring(0, 2).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedProduct.user_id?.name || 'Usuário'}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <MapPin size={12} className="mr-1" />
                                            Apto {selectedProduct.user_id?.apartment || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 py-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                                    {selectedProduct.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-8">
                        <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle mr-2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                            Chamar no WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
