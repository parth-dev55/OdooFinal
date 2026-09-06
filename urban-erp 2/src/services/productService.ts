import { apiClient } from './apiClient';
import { Product, CreateProductDTO, UpdateProductDTO, ProductStatus } from '../types/product';

export interface ProductFilterParams {
  search?: string;
  type?: string;
  status?: string;
  category?: string;
}

const STORAGE_KEY = 'urban_erp_products_store_v1';

const INITIAL_STARTER_PRODUCTS: Product[] = [
  {
    id: 'PRD-2001',
    name: 'Ergonomic Executive Office Chair',
    type: 'GOODS',
    salesPrice: 349.99,
    purchaseCost: 195.00,
    category: 'Office Furniture',
    status: 'ACTIVE',
    description: 'High-back mesh ergonomic desk chair with lumbar support and adjustable 4D armrests.',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'PRD-2002',
    name: 'ERP System Implementation & Setup',
    type: 'SERVICE',
    salesPrice: 1200.00,
    purchaseCost: 450.00,
    category: 'Professional Services',
    status: 'ACTIVE',
    description: 'Complete workspace migration, chart of accounts setup, and staff onboarding package.',
    createdAt: '2026-08-14T11:30:00Z',
  },
  {
    id: 'PRD-2003',
    name: 'Executive Workstation Starter Combo',
    type: 'COMBO',
    salesPrice: 899.00,
    purchaseCost: 560.00,
    category: 'Bundles & Packages',
    status: 'ACTIVE',
    description: 'Includes dual-motor standing desk, ergonomic chair, and cable management tray.',
    createdAt: '2026-08-22T14:20:00Z',
  },
  {
    id: 'PRD-2004',
    name: 'Wireless Conference Speakerphone',
    type: 'GOODS',
    salesPrice: 189.50,
    purchaseCost: 110.00,
    category: 'Electronics',
    status: 'ACTIVE',
    description: '360-degree omnidirectional microphone array with AI background noise cancellation.',
    createdAt: '2026-08-25T16:45:00Z',
  },
];

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage parse issues
  }
  return INITIAL_STARTER_PRODUCTS;
}

function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    // Ignore storage quota issues
  }
}

export const productService = {
  /**
   * GET /api/products
   * Fetches the list of products with optional query filtering
   */
  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    let endpoint = '/api/products';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search?.trim()) queryParams.set('search', params.search.trim());
      if (params.type && params.type !== 'ALL') queryParams.set('type', params.type);
      if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
      if (params.category && params.category !== 'ALL') queryParams.set('category', params.category);

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    try {
      const data = await apiClient(endpoint, {
        method: 'GET',
      });

      let results: Product[] = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.content)) {
        results = data.content;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        saveStoredProducts(results);
      }
      return results;
    } catch (error: any) {
      console.warn('Spring Boot backend currently in standby or unreachable for products:', error?.message || error);
      let local = getStoredProducts();

      if (params?.type && params.type !== 'ALL') {
        local = local.filter(p => p.type === params.type);
      }
      if (params?.status && params.status !== 'ALL') {
        local = local.filter(p => p.status === params.status);
      }
      if (params?.category && params.category !== 'ALL') {
        local = local.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        local = local.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/products/{id}
   * Fetches single product by ID
   */
  getProductById: async (id: string | number): Promise<Product> => {
    try {
      return await apiClient(`/api/products/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend unavailable, retrieving product from local buffer:', error?.message || error);
      const product = getStoredProducts().find(p => String(p.id) === String(id));
      if (product) return product;
      throw error;
    }
  },

  /**
   * POST /api/products
   * Creates a new product
   */
  createProduct: async (productData: CreateProductDTO): Promise<Product> => {
    try {
      const created = await apiClient('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      if (created && (created.id || created.name)) {
        const current = getStoredProducts();
        saveStoredProducts([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend unavailable, buffering created product locally:', error?.message || error);
    }

    const newProduct: Product = {
      id: 'PRD-' + Date.now().toString().slice(-4),
      name: productData.name,
      type: productData.type,
      salesPrice: Number(productData.salesPrice) || 0,
      purchaseCost: Number(productData.purchaseCost) || 0,
      category: productData.category,
      description: productData.description,
      sku: productData.sku,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const current = getStoredProducts();
    saveStoredProducts([newProduct, ...current]);
    return newProduct;
  },

  /**
   * PUT /api/products/{id}
   * Updates an existing product
   */
  updateProduct: async (id: string | number, productData: UpdateProductDTO): Promise<Product> => {
    try {
      const updated = await apiClient(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      if (updated && (updated.id || updated.name)) {
        const current = getStoredProducts();
        saveStoredProducts(current.map(p => String(p.id) === String(id) ? { ...p, ...updated } : p));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend unavailable, updating product in local buffer:', error?.message || error);
    }

    const current = getStoredProducts();
    const existing = current.find(p => String(p.id) === String(id));
    const merged: Product = {
      id,
      name: productData.name || existing?.name || '',
      type: productData.type || existing?.type || 'GOODS',
      salesPrice: productData.salesPrice !== undefined ? Number(productData.salesPrice) : (existing?.salesPrice || 0),
      purchaseCost: productData.purchaseCost !== undefined ? Number(productData.purchaseCost) : (existing?.purchaseCost || 0),
      category: productData.category || existing?.category || 'General',
      description: productData.description !== undefined ? productData.description : existing?.description,
      sku: productData.sku !== undefined ? productData.sku : existing?.sku,
      status: productData.status || existing?.status || 'ACTIVE',
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };
    saveStoredProducts(current.map(p => String(p.id) === String(id) ? merged : p));
    return merged;
  },

  /**
   * PATCH /api/products/{id}/status
   * Updates product status (ACTIVE <-> INACTIVE)
   */
  updateProductStatus: async (id: string | number, status: ProductStatus): Promise<Product | void> => {
    try {
      const res = await apiClient(`/api/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredProducts();
      saveStoredProducts(current.map(p => String(p.id) === String(id) ? { ...p, status } : p));
      return res;
    } catch (error: any) {
      console.warn('Backend unavailable, updating status in local buffer:', error?.message || error);
      const current = getStoredProducts();
      saveStoredProducts(current.map(p => String(p.id) === String(id) ? { ...p, status } : p));
    }
  },
};
