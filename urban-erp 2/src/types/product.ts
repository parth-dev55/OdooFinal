export type ProductType = 'GOODS' | 'SERVICE' | 'COMBO';
export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string | number;
  name: string;
  type: ProductType;
  salesPrice: number;
  purchaseCost: number;
  category: string;
  status: ProductStatus;
  description?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  name: string;
  type: ProductType;
  salesPrice: number;
  purchaseCost: number;
  category: string;
  description?: string;
  sku?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: ProductStatus;
}
