import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  RotateCw, 
  Eye, 
  Edit, 
  Power, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  X, 
  Layers, 
  Boxes, 
  Wrench, 
  Sparkles 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { Product, ProductType, ProductStatus, CreateProductDTO, UpdateProductDTO } from '../../types/product';
import { productService } from '../../services/productService';
import { ProductFormModal } from '../../components/products/ProductFormModal';
import { ProductViewModal } from '../../components/products/ProductViewModal';
import { ProductDeactivateModal } from '../../components/products/ProductDeactivateModal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(null);

  // Fetch products from Spring Boot backend (with local buffer fallback)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.warn('Backend connection notice for products:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers for Modals
  const handleOpenCreate = () => {
    setActiveProduct(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setActiveProduct(product);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenDeactivate = (product: Product) => {
    setDeactivateTarget(product);
    setIsDeactivateModalOpen(true);
  };

  // Form Submission (Add or Edit)
  const handleFormSubmit = async (data: CreateProductDTO | UpdateProductDTO) => {
    if (formMode === 'create') {
      const newProduct = await productService.createProduct(data as CreateProductDTO);
      setProducts(prev => [newProduct, ...prev]);
      triggerToast(`Product "${newProduct.name}" added successfully.`);
    } else if (activeProduct) {
      const updatedProduct = await productService.updateProduct(activeProduct.id, data);
      setProducts(prev => prev.map(p => p.id === activeProduct.id ? (updatedProduct || { ...p, ...data }) : p));
      triggerToast(`Product "${data.name || activeProduct.name}" updated successfully.`);
    }
  };

  // Status toggle (Deactivate/Reactivate)
  const handleStatusChange = async (product: Product, newStatus: ProductStatus) => {
    await productService.updateProductStatus(product.id, newStatus);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    triggerToast(
      newStatus === 'INACTIVE'
        ? `Product "${product.name}" has been deactivated.`
        : `Product "${product.name}" reactivated successfully.`
    );
  };

  // Distinct categories available in current dataset
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category?.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search matching Product Name or Category
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q))
      );

      // Type filter (Goods, Service, Combo)
      const matchesType = selectedType === 'ALL' || product.type === selectedType;

      // Status filter (Active, Inactive)
      const matchesStatus = selectedStatus === 'ALL' || product.status === selectedStatus;

      // Category filter
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, selectedType, selectedStatus, selectedCategory]);

  // Metric stats
  const stats = useMemo(() => {
    const total = products.length;
    const goods = products.filter(p => p.type === 'GOODS').length;
    const services = products.filter(p => p.type === 'SERVICE').length;
    const combos = products.filter(p => p.type === 'COMBO').length;
    const active = products.filter(p => p.status === 'ACTIVE').length;
    return { total, goods, services, combos, active };
  }, [products]);

  // Styling helper for product types
  const getTypeBadge = (type: ProductType) => {
    switch (type) {
      case 'GOODS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Boxes className="w-3 h-3 text-blue-500" />
            GOODS
          </span>
        );
      case 'SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wrench className="w-3 h-3 text-emerald-500" />
            SERVICE
          </span>
        );
      case 'COMBO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-500" />
            COMBO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
            {type}
          </span>
        );
    }
  };

  const isFiltered = selectedType !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || searchQuery !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your products, pricing and categories.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm shadow-purple-200 transition-all hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500 block mb-1">Total Products</span>
                <span className="text-xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-blue-600 block mb-1">Goods</span>
                <span className="text-xl font-bold text-gray-900">{stats.goods}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-emerald-600 block mb-1">Services</span>
                <span className="text-xl font-bold text-gray-900">{stats.services}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-amber-600 block mb-1">Combos</span>
                <span className="text-xl font-bold text-gray-900">{stats.combos}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-green-600 block mb-1">Active</span>
                <span className="text-xl font-bold text-gray-900">{stats.active}</span>
              </div>
            </div>

            {/* Toast Feedback */}
            {toastMessage && (
              <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-md transition-all ${
                toastMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-900' 
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">{toastMessage.message}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Top Action Controls: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Products Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, category, or SKU..."
                    className="w-full pl-10 pr-9 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] focus:bg-white transition-all text-gray-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle & Refresh Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      showFilterMenu || isFiltered
                        ? 'bg-purple-50 text-[#6D54B5] border-purple-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {isFiltered && (
                      <span className="w-2 h-2 rounded-full bg-[#6D54B5]"></span>
                    )}
                  </button>

                  <button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors"
                    title="Refresh product list"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
                  {/* Type Filter Buttons (Goods, Service, Combo) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Type:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Goods', value: 'GOODS' },
                      { label: 'Service', value: 'SERVICE' },
                      { label: 'Combo', value: 'COMBO' },
                    ].map(f => (
                      <button
                        key={f.value}
                        onClick={() => setSelectedType(f.value)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          selectedType === f.value
                            ? 'bg-[#6D54B5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter Buttons (Active, Inactive) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Status:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Active', value: 'ACTIVE' },
                      { label: 'Inactive', value: 'INACTIVE' },
                    ].map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedStatus(s.value)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          selectedStatus === s.value
                            ? 'bg-[#6D54B5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Category Dropdown Filter if categories available */}
                  {availableCategories.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-semibold uppercase mr-1">Category:</span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#6D54B5]"
                      >
                        <option value="ALL">All Categories</option>
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Reset Filters Link */}
                  {isFiltered && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-[#6D54B5] hover:underline font-semibold ml-auto"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Product Name</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-right">Sales Price</th>
                      <th className="py-3.5 px-4 text-right">Purchase Cost</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#6D54B5] mb-2" />
                          <span>Loading products from backend...</span>
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-base font-semibold text-gray-700">No products found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {isFiltered
                              ? 'No products match your search or filter criteria. Try resetting filters.'
                              : 'No products have been added yet. Click "+ Add Product" to create your first catalog item.'}
                          </p>
                          {isFiltered ? (
                            <button
                              onClick={resetFilters}
                              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                            >
                              Clear All Filters
                            </button>
                          ) : (
                            <button
                              onClick={handleOpenCreate}
                              className="mt-4 px-4 py-2 bg-[#6D54B5] hover:bg-[#5C459E] text-white text-xs font-semibold rounded-xl transition-colors"
                            >
                              + Add First Product
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const sPrice = Number(product.salesPrice) || 0;
                        const pCost = Number(product.purchaseCost) || 0;

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-purple-50/20 transition-colors group"
                          >
                            {/* Product Name & SKU */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div
                                    onClick={() => handleOpenView(product)}
                                    className="font-semibold text-gray-900 truncate hover:text-[#6D54B5] cursor-pointer"
                                  >
                                    {product.name}
                                  </div>
                                  {product.sku && (
                                    <div className="text-xs text-gray-400 font-mono">
                                      SKU: {product.sku}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getTypeBadge(product.type)}
                            </td>

                            {/* Sales Price */}
                            <td className="py-3.5 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                              ${sPrice.toFixed(2)}
                            </td>

                            {/* Purchase Cost */}
                            <td className="py-3.5 px-4 text-right text-gray-600 whitespace-nowrap">
                              ${pCost.toFixed(2)}
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                                <Tag className="w-3 h-3 text-gray-400" />
                                {product.category || 'General'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  product.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {product.status === 'ACTIVE' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {product.status}
                              </span>
                            </td>

                            {/* Actions (View, Edit, Deactivate) */}
                            <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Action */}
                                <button
                                  onClick={() => handleOpenView(product)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Product"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Action */}
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-1.5 text-gray-400 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Deactivate / Reactivate Action */}
                                <button
                                  onClick={() => handleOpenDeactivate(product)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    product.status === 'ACTIVE'
                                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  }`}
                                  title={product.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="px-6 py-3.5 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                <span>
                  Showing <strong className="font-semibold text-gray-800">{filteredProducts.length}</strong> of{' '}
                  <strong className="font-semibold text-gray-800">{products.length}</strong> products
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Connected to Spring Boot API: /api/products
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={activeProduct}
        mode={formMode}
      />

      {/* View Details Modal */}
      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewProduct}
        onEdit={(p) => handleOpenEdit(p)}
        onToggleStatus={(p) => handleOpenDeactivate(p)}
      />

      {/* Deactivate / Reactivate Confirmation Modal */}
      <ProductDeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        product={deactivateTarget}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default ProductsPage;

