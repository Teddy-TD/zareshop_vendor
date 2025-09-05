import { baseApi } from '@/services/baseApi';

// Enums matching Prisma schema
export enum OrderStatus {
  new = 'new',
  processing = 'processing',
  completed = 'completed'
}

export enum PaymentMethodType {
  wallet = 'wallet',
  external = 'external',
  cod = 'cod'
}

export enum DeliveryStatus {
  not_assigned = 'not_assigned',
  assigned = 'assigned',
  out_for_delivery = 'out_for_delivery',
  delivered = 'delivered'
}

export enum RatingEntityType {
  product = 'product',
  vendor = 'vendor'
}

// Base types matching Prisma schema
type Image = {
  id: number;
  image_url: string;
  created_at: string;
  category_id?: number;
  subcategory_id?: number;
  product_id?: number;
};

type Video = {
  id: number;
  video_url: string;
  created_at: string;
  category_id?: number;
  subcategory_id?: number;
  product_id?: number;
};

type Spec = {
  id: number;
  key: string;
  value: string;
};

type Rating = {
  id: number;
  entity_type: RatingEntityType;
  entity_id: number;
  total_ratings: number;
  sum_ratings: number;
  average_rating: number;
};

type Category = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
};

type Subcategory = {
  id: number;
  name: string;
  created_at: string;
  category_id: number;
  category: Category;
};

type Vendor = {
  id: number;
  name?: string;
  type: 'individual' | 'business';
  description?: string;
  status?: boolean;
  is_approved?: boolean;
  subscription_id: number;
  user_id: number;
  wallet_id?: number;
  rating_id?: number;
  rating?: Rating;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  has_discount: boolean;
  stock: number;
  stock_status: 'active' | 'low_stock' | 'out_of_stock';
  low_stock_threshold: number;
  is_active: boolean;
  price: number;
  created_at: string;
  vendor_id: number;
  category_id: number;
  subcategory_id: number;
  rating_id?: number;
  vendor: Vendor;
  category: Category;
  subcategory: Subcategory;
  rating?: Rating;
  images: Image[];
  videos: Video[];
  specs: Spec[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// API Response types
export type GetProductsByVendorResponse = {
  products: Product[];
  pagination: Pagination;
};

export type GetProductsResponse = {
  products: Product[];
  pagination: Pagination;
};

export type GetProductByIdResponse = {
  product: Product;
};

export type GetCategoriesResponse = {
  categories: Category[];
};

export type GetSubcategoriesResponse = {
  subcategories: Subcategory[];
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  has_discount?: boolean;
  stock: number;
  price: number;
  low_stock_threshold?: number;
  vendor_id: number;
  category_id: number;
  subcategory_id: number;
  specs?: Array<{ key: string; value: string }>;
};

export type UpdateProductRequest = Partial<CreateProductRequest> & {
  id: number;
};

export type DeleteProductResponse = {
  message: string;
  success: boolean;
};

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch products by vendor
    getProductsByVendor: build.query<
      GetProductsByVendorResponse,
      { vendorId: number; page?: number; limit?: number }
    >({
      query: ({ vendorId, page = 1, limit = 10 }) => ({
        url: `vendors/${vendorId}/products`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Products"],
    }),

    // Fetch all products with pagination
    getProducts: build.query<
      GetProductsResponse,
      { page?: number; limit?: number; category_id?: number; subcategory_id?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, category_id, subcategory_id, search }) => ({
        url: "products",
        method: "GET",
        params: { page, limit, category_id, subcategory_id, search },
      }),
      providesTags: ["Products"],
    }),

    // Fetch single product by ID
    getProductById: build.query<GetProductByIdResponse, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // Fetch all categories
    getCategories: build.query<GetCategoriesResponse, void>({
      query: () => ({
        url: "category",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),

    // Fetch subcategories by category
    getSubcategoriesByCategory: build.query<GetSubcategoriesResponse, number>({
      query: (categoryId) => ({
        url: `category/${categoryId}/subcategories`,
        method: "GET",
      }),
      transformResponse: (response: Subcategory[]) => ({
        subcategories: response
      }),
      providesTags: ["Subcategories"],
    }),

    // Create new product
    createProduct: build.mutation<{ 
      product: Product; 
      message: string; 
      uploadJobs: {
        total: number;
        jobs: Array<{
          jobId: string;
          fileName: string;
          status: string;
          message: string;
          recordId?: number;
        }>;
        message: string;
      };
    }, CreateProductRequest | FormData>({
      query: (body) => ({
        url: "products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    // Update existing product
    updateProduct: build.mutation<{ 
      product: Product; 
      message: string; 
      uploadJobs: {
        total: number;
        jobs: Array<{
          jobId: string;
          fileName: string;
          status: string;
          message: string;
          recordId?: number;
        }>;
        message: string;
      };
    }, { id: number; body: UpdateProductRequest | FormData }>({
      query: ({ id, body }) => ({
        url: `products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Products", id }, "Products"],
    }),

    // Delete product
    deleteProduct: build.mutation<DeleteProductResponse, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Upload product images
    uploadProductImages: build.mutation<
      { images: Image[]; message: string },
      { productId: number; images: File[] }
    >({
      query: ({ productId, images }) => {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("images", image);
        });
        return {
          url: `products/${productId}/images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { productId }) => [{ type: "Products", id: productId }],
    }),

    // Upload product videos
    uploadProductVideos: build.mutation<
      { videos: Video[]; message: string },
      { productId: number; videos: File[] }
    >({
      query: ({ productId, videos }) => {
        const formData = new FormData();
        videos.forEach((video) => {
          formData.append("videos", video);
        });
        return {
          url: `products/${productId}/videos`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { productId }) => [{ type: "Products", id: productId }],
    }),

    // Search products
    searchProducts: build.query<
      GetProductsResponse,
      { query: string; page?: number; limit?: number }
    >({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "products/search",
        method: "GET",
        params: { q: query, page, limit },
      }),
      providesTags: ["Products"],
    }),

    // Get products by stock status
    getProductsByStockStatus: build.query<
      GetProductsResponse,
      { status: 'active' | 'low_stock' | 'out_of_stock'; page?: number; limit?: number; vendor_id?: number }
    >({
      query: ({ status, page = 1, limit = 10, vendor_id }) => ({
        url: `products/stock-status/${status}`,
        method: "GET",
        params: { page, limit, vendor_id },
      }),
      providesTags: ["Products"],
    }),

    // Get low stock products for vendor
    getLowStockProducts: build.query<
      GetProductsResponse,
      { vendorId: number; page?: number; limit?: number }
    >({
      query: ({ vendorId, page = 1, limit = 10 }) => ({
        url: `products/vendor/${vendorId}/low-stock`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Products"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProductsByVendorQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useUploadProductVideosMutation,
  useSearchProductsQuery,
  useGetProductsByStockStatusQuery,
  useGetLowStockProductsQuery,
} = productApi;
  