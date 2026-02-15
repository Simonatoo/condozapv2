import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Tag, MapPin, DollarSign, Package, Plus, X, Camera } from 'lucide-react';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        value: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Status Sheet State
    const [statusSheetProduct, setStatusSheetProduct] = useState(null);

    const fetchMyProducts = async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/products?user_id=${user.id}`);
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching my products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', value: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            value: product.value
        });
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!statusSheetProduct) return;
        try {
            await api.put(`/products/${statusSheetProduct._id}`, { status: newStatus });
            setStatusSheetProduct(null); // Close sheet
            fetchMyProducts();
        } catch (err) {
            console.error("Error updating status", err);
            alert("Erro ao atualizar status");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
            alert("Sessão inválida. Por favor, faça login novamente.");
            return;
        }

        setSubmitting(true);
        try {
            if (editingProduct) {
                // Update existing product
                await api.put(`/products/${editingProduct._id}`, {
                    ...formData,
                    status: editingProduct.status // Keep existing status or allow edit? User didn't specify. Keeping it simple.
                });
            } else {
                // Create new product
                await api.post('/products', {
                    ...formData,
                    user_id: user.id,
                    status: 'enabled'
                });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', value: '' });
            fetchMyProducts();
        } catch (err) {
            console.error("Error saving product", err);
            alert("Erro ao salvar produto");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !products.length && !isModalOpen) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="px-4 py-4 space-y-4 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Meus Produtos</h2>
                    <span className="text-sm text-blue-600 font-medium">{products.length} itens</span>
                </div>

                {/* Product List */}
                {products.map((product) => (
                    <div
                        key={product._id}
                        onClick={() => handleEdit(product)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform duration-100 cursor-pointer"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                  ${product.status === 'enabled' ? 'bg-green-100 text-green-700' :
                                        product.status === 'sold' ? 'bg-gray-100 text-gray-500 line-through' : 'bg-red-100 text-red-700'}`}>
                                    {product.status === 'enabled' ? 'Disponível' : product.status === 'sold' ? 'Vendido' : 'Indisponível'}
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <div className="flex items-center text-gray-900 font-bold text-lg">
                                    <span className="text-sm text-gray-500 mr-1">R$</span>
                                    {product.value.toFixed(2).replace('.', ',')}
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-50">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setStatusSheetProduct(product);
                                    }}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                                >
                                    Atualizar Status
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Package size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Nenhum produto cadastrado</p>
                        <p className="text-sm">Seus anúncios aparecerão aqui</p>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={handleAddNew}
                className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors z-20 active:scale-90"
            >
                <Plus size={24} strokeWidth={3} />
            </button>

            {/* Status Action Sheet */}
            {statusSheetProduct && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                        onClick={() => setStatusSheetProduct(null)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-4 pb-8 animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                            Alterar Status: {statusSheetProduct.name}
                        </h3>

                        <div className="space-y-3">
                            {statusSheetProduct.status !== 'enabled' && (
                                <button
                                    onClick={() => handleStatusUpdate('enabled')}
                                    className="w-full p-4 bg-gray-50 hover:bg-green-50 text-gray-900 hover:text-green-700 font-bold rounded-xl text-left flex items-center transition-colors"
                                >
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                                    Ativar Produto
                                </button>
                            )}

                            {statusSheetProduct.status !== 'sold' && (
                                <button
                                    onClick={() => handleStatusUpdate('sold')}
                                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-left flex items-center transition-colors"
                                >
                                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-3" />
                                    Marcar como Vendido
                                </button>
                            )}

                            {statusSheetProduct.status !== 'disabled' && (
                                <button
                                    onClick={() => handleStatusUpdate('disabled')}
                                    className="w-full p-4 bg-gray-50 hover:bg-red-50 text-gray-900 hover:text-red-700 font-bold rounded-xl text-left flex items-center transition-colors"
                                >
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3" />
                                    Desativar Anúncio
                                </button>
                            )}

                            <button
                                onClick={() => setStatusSheetProduct(null)}
                                className="w-full p-4 text-gray-500 font-medium text-center mt-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Full Screen Modal (Edit/Create) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 p-2 rounded-full hover:bg-gray-100">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6 overflow-y-auto">
                        {/* Image Placeholder */}
                        <div className="w-full h-40 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                            <Camera size={32} className="mb-2 text-gray-300" />
                            <span className="text-sm font-medium">Adicionar Foto (Em breve)</span>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Nome do Produto</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                placeholder="Ex: Furadeira Bosch"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Valor (R$)</label>
                            <input
                                name="value"
                                type="number"
                                value={formData.value}
                                onChange={handleInputChange}
                                required
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Descrição</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={5}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                                placeholder="Descreva os detalhes do produto, tempo de uso, estado de conservação..."
                            />
                        </div>

                        <div className="pt-4 pb-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Anunciar Produto')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MyProducts;
