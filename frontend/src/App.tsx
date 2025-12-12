import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, ShoppingCart as ShoppingCartIcon, Users } from 'lucide-react';
import { authService, type User } from './lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { DiscoveryPage } from './components/DiscoveryPage';
import { ConfiguratorWizard } from './components/ConfiguratorWizard';
import { ConfigurationReview } from './components/ConfigurationReview';
import { PurchaseFlow } from './components/PurchaseFlow';
import { CreatorStudio } from './components/CreatorStudio';
import { ShoppingCartPage, type CartItem } from './components/ShoppingCartPage';
import { Button } from './components/ui/button';
import { Toaster, toast } from 'sonner';
import { LoginDialog } from './components/LoginDialog';
import type { ConfigurationData } from './components/ConfiguratorWizard';
import type { Product } from './components/ConfigurationReview';

type AppView = 'discovery' | 'configurator' | 'review' | 'purchase' | 'creator' | 'cart';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('discovery');
  const [configuration, setConfiguration] = useState<ConfigurationData | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Auth check failed:", error);
          authService.logout();
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setConfiguration(null);
    setCurrentView('discovery');
    toast.info('Logged out successfully');
  };

  const handleStartConfiguration = () => {
    setCurrentView('configurator');
  };

  const handleSignIn = () => {
    setIsLoginOpen(true);
  };

  const handleConfigurationComplete = (config: ConfigurationData) => {
    setConfiguration(config);
    setCurrentView('review');
  };

  const handleBackToDiscovery = () => {
    setCurrentView('discovery');
    setConfiguration(null);
  };

  const handleProceedToPurchase = (products: Product[]) => {
    setSelectedProducts(products);
    setCurrentView('purchase');
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'discovery':
        return <DiscoveryPage
          onStartConfiguration={handleStartConfiguration}
          onAddToCart={handleAddToCart}
        />;
      case 'configurator':
        return (
          <ConfiguratorWizard
            onComplete={handleConfigurationComplete}
            onBack={handleBackToDiscovery}
          />
        );
      case 'review':
        return configuration ? (
          <ConfigurationReview
            config={configuration}
            onBack={() => setCurrentView('configurator')}
            onProceedToPurchase={handleProceedToPurchase}
          />
        ) : null;
      case 'purchase':
        return (
          <PurchaseFlow
            products={selectedProducts}
            onBack={() => setCurrentView('review')}
          />
        );
      case 'creator':
        return <CreatorStudio onBack={handleBackToDiscovery} />;
      case 'cart':
        return (
          <ShoppingCartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={() => { toast.success('Checkout not implemented yet'); }}
            onBack={handleBackToDiscovery}
          />
        );
      default:
        return <DiscoveryPage
          onStartConfiguration={handleStartConfiguration}
          onAddToCart={handleAddToCart}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Navigation Bar - shown on all pages */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setCurrentView('discovery');
              setConfiguration(null);
            }}
          >
            DeskHub
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCurrentView('cart')}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Button>

            <Button
              variant={currentView === 'creator' ? 'default' : 'ghost'}
              onClick={() => {
                if (!user) {
                  toast.info('Please sign in to access Creator Studio');
                  setIsLoginOpen(true);
                } else {
                  setCurrentView('creator');
                }
              }}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Creator Studio
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            )}

            <Button
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={handleStartConfiguration}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>
      {renderCurrentView()}
      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLoginSuccess={(user) => {
          if (user) setUser(user);
        }}
      />
      <Toaster />
    </div>
  );
}
