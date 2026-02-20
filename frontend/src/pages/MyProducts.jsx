import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Package, Plus, X, Camera, Pencil, Trash, MoreVertical, CheckCircle, Info } from 'lucide-react';
import ActionSheet from '../components/actionSheet/ActionSheet';
import Modal from '../components/modal/Modal';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Filter State
    const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'sold'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmSaleModalOpen, setIsConfirmSaleModalOpen] = useState(false);
    const [productToSell, setProductToSell] = useState(null);

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        value: '',
        category: ''
    });

    // Split state for easier management
    const [existingImages, setExistingImages] = useState([]); // URLs from DB
    const [newImages, setNewImages] = useState([]); // File objects
    const [newImagePreviews, setNewImagePreviews] = useState([]); // Blob URLs
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
            const [productsRes, categoriesRes] = await Promise.all([
                api.get(`/products?user_id=${user.id}`),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
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
        setEditingProduct(null);
        setFormData({ name: '', description: '', value: '', category: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            value: product.value,
            category: product.category?._id || product.category || ''
        });
        setExistingImages(product.images || []);
        setNewImages([]);
        setNewImagePreviews([]);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (newStatus, targetProduct = null) => {
        const productToUpdate = targetProduct || statusSheetProduct;
        if (!productToUpdate) return;
        try {
            // Need to send FormData to handle keptImages if needed, or update backend to handle partial JSON updates.
            // Current backend updateProduct expects keptImages in body if we want to keep them, 
            // BUT if we don't send *any* image data (no files, no keptImages) and we use the 'images' field logic...
            // Let's check backend logic:
            // "let finalImages = []; if (req.body.keptImages) ... product.images = finalImages;"
            // If keptImages is undefined, finalImages is empty.
            // So we MUST send keptImages.

            const data = {
                status: newStatus,
                keptImages: productToUpdate.images || []
            };

            await api.put(`/products/${productToUpdate._id}`, data);

            if (statusSheetProduct) {
                setStatusSheetProduct(null); // Close sheet if open
            }
            if (isConfirmSaleModalOpen) {
                setIsConfirmSaleModalOpen(false);
                setProductToSell(null);
            }
            fetchMyProducts();
        } catch (err) {
            console.error("Error updating status", err);
            alert("Erro ao atualizar status");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

        try {
            await api.delete(`/products/${productId}`);
            setStatusSheetProduct(null);
            fetchMyProducts();
        } catch (err) {
            console.error("Error deleting product", err);
            alert("Erro ao excluir produto");
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
                const data = new FormData();
                data.append('name', formData.name);
                data.append('description', formData.description);
                data.append('value', formData.value);
                data.append('category', formData.category);
                data.append('status', editingProduct.status);

                // Append kept images
                existingImages.forEach((img) => {
                    data.append('keptImages', img);
                });

                // Append new images
                newImages.forEach((image) => {
                    data.append('images', image);
                });

                await api.put(`/products/${editingProduct._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new product
                const data = new FormData();
                data.append('name', formData.name);
                data.append('description', formData.description);
                data.append('value', formData.value);
                data.append('category', formData.category);
                data.append('user_id', user.id);
                data.append('status', 'enabled');

                newImages.forEach((image) => {
                    data.append('images', image);
                });

                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setEditingProduct(null);
            setFormData({ name: '', description: '', value: '', category: '' });
            setExistingImages([]);
            setNewImages([]);
            setNewImagePreviews([]);
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

            {/* Confirm Sale Modal */}
            <Modal
                isOpen={isConfirmSaleModalOpen}
                onClose={() => {
                    setIsConfirmSaleModalOpen(false);
                    setProductToSell(null);
                }}
                title="Confirmar Venda"
                size="md"
            >
                <div className="flex flex-col items-center text-center">
                    <p className="text-gray-600 mb-6">
                        Uma vez confirmado, este anúncio não será mais exibido na página inicial para os seus vizinhos. Você poderá reativá-lo depois se desejar.
                    </p>
                    <div className="flex flex-col w-full gap-2">
                        <button
                            onClick={() => handleStatusUpdate('sold', productToSell)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
                        >
                            Confirmar venda
                        </button>
                        <button
                            onClick={() => {
                                setIsConfirmSaleModalOpen(false);
                                setProductToSell(null);
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
                        >
                            Ainda não vendi
                        </button>
                    </div>
                </div>
            </Modal>

            <main className="px-4 py-4 space-y-4 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Meus Anúncios</h2>
                    <span className="text-sm text-blue-600 font-medium">
                        {products.filter(p => activeFilter === 'active' ? p.status !== 'sold' : p.status === 'sold').length} itens
                    </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <button
                        onClick={() => setActiveFilter('active')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeFilter === 'active'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border-gray-200'
                            }`}
                    >
                        Ativos
                    </button>
                    <button
                        onClick={() => setActiveFilter('sold')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeFilter === 'sold'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border-gray-200'
                            }`}
                    >
                        Vendidos
                    </button>
                </div>

                {/* Product List */}
                {products
                    .filter(product => activeFilter === 'active' ? product.status !== 'sold' : product.status === 'sold')
                    .map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-transform duration-100"
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

                                {/* Image Display in List */}
                                {product.images && product.images.length > 0 && (
                                    <div className="mb-3 h-40 rounded-xl overflow-hidden">
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center text-gray-900 font-bold text-lg">
                                        <span className="text-sm text-gray-500 mr-1">R$</span>
                                        {product.value.toFixed(2).replace('.', ',')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {product.status !== 'sold' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProductToSell(product);
                                                    setIsConfirmSaleModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-green-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors"
                                            >
                                                <CheckCircle size={16} />
                                                Confirmar venda
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusSheetProduct(product);
                                            }}
                                            className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
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
                <ActionSheet onClose={() => setStatusSheetProduct(null)} options={[
                    {
                        show: statusSheetProduct.status !== 'enabled',
                        label: "Ativar produto",
                        variant: "default",
                        action: () => handleStatusUpdate('enabled')
                    },
                    {
                        show: statusSheetProduct.status !== 'sold',
                        label: "Marcar como Vendido",
                        variant: "default",
                        action: () => handleStatusUpdate('sold')
                    },
                    {
                        show: statusSheetProduct.status !== 'disabled',
                        label: "Desativar Anúncio",
                        variant: "default",
                        action: () => handleStatusUpdate('disabled')
                    },
                    {
                        show: true,
                        label: "Editar Produto",
                        variant: "default",
                        icon: <Pencil size={18} strokeWidth={2} />,
                        action: () => handleEdit(statusSheetProduct)
                    },
                    {
                        show: true,
                        label: "Excluir Produto",
                        variant: "destructive",
                        icon: <Trash size={18} strokeWidth={2} />,
                        action: () => handleDeleteProduct(statusSheetProduct._id)
                    }
                ]} onClickItem={(item) => item.action && item.action()} />
            )
            }

            {/* Full Screen Modal (Edit/Create) */}
            {
                isModalOpen && (
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
                            {/* Image Upload */}
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Imagens do Produto (Max 5)</label>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {/* Existing Images */}
                                    {existingImages.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                            <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setExistingImages(existingImages.filter((_, i) => i !== index));
                                                }}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Images */}
                                    {newImagePreviews.map((url, index) => (
                                        <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                            <img src={url} alt={`New ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = [...newImagePreviews];
                                                    const newFiles = [...newImages];
                                                    newPreviews.splice(index, 1);
                                                    newFiles.splice(index, 1);
                                                    setNewImagePreviews(newPreviews);
                                                    setNewImages(newFiles);
                                                }}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    {(existingImages.length + newImages.length) < 5 && (
                                        <label className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <Camera size={24} className="mb-1" />
                                            <span className="text-xs">Adicionar</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    if (existingImages.length + newImages.length + files.length > 5) {
                                                        alert("Máximo de 5 imagens permitidas");
                                                        return;
                                                    }
                                                    setNewImages([...newImages, ...files]);
                                                    const newPreviews = files.map(file => URL.createObjectURL(file));
                                                    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Categoria</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 appearance-none"
                                    >
                                        <option value="" disabled>Selecione uma categoria</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
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
                    </div >
                )
            }
        </div >
    );
};

export default MyProducts;
