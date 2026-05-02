export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  addresses: Address[];
  paymentMethods: SavedPaymentMethod[];
  wishlist: string[];
  createdAt: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'COD' | 'STRIPE';
  details: string;
  isDefault: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductSpecs {
  processor: string;
  ram: string;
  ddrVersion?: string;
  storage: string;
  gpu: string;
  display: string;
  battery: string;
  os: string;
  weight: string;
  color: string;
  ports: string;
  wireless: string;
  keyboard: string;
  webcam: string;
  warranty: string;
}

export interface ProductImage {
  driveFileId: string;
  url: string;
  name: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  discount: number;
  discountedPrice: number;
  stock: number;
  category: string;
  specs: ProductSpecs;
  images: ProductImage[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryOption: 'EXPRESS' | 'STORE_PICKUP';
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  read: boolean;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  adminId?: string;
  status: 'ACTIVE' | 'CLOSED';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
}
