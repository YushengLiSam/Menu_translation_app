import { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2, RefreshCw, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfigurationData } from './ConfiguratorWizard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
  compatible: boolean;
  issue?: string;
}

interface ConfigurationReviewProps {
  config: ConfigurationData;
  onBack: () => void;
  onProceedToPurchase: (products: Product[]) => void;
}

const generateProducts = (config: ConfigurationData): Product[] => {
  const baseProducts: Product[] = [
    {
      id: '1',
      name: 'IKEA BEKANT Electric Standing Desk',
      category: 'Desk',
      price: 2999,
      image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400',
      specs: `${config.spaceWidth}cm × ${config.spaceDepth}cm`,
      compatible: true
    },
    {
      id: '2',
      name: 'Herman Miller Aeron Ergonomic Chair',
      category: 'Chair',
      price: 8999,
      image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
      specs: 'Adjustable height, lumbar support',
      compatible: config.budget >= 8000,
      issue: config.budget < 8000 ? 'Over budget, recommend replacing with more affordable option' : undefined
    },
    {
      id: '3',
      name: 'LG 27" 4K UHD Monitor',
      category: 'Monitor',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      specs: '27-inch 4K IPS panel',
      compatible: true
    },
    {
      id: '4',
      name: 'Ergotron LX Monitor Arm',
      category: 'Accessories',
      price: 899,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      specs: 'Supports VESA standard',
      compatible: config.spaceDepth >= 50,
      issue: config.spaceDepth < 50 ? 'Insufficient desk depth, arm may extend beyond desk edge' : undefined
    },
    {
      id: '5',
      name: 'Keychron K8 Pro Mechanical Keyboard',
      category: 'Peripherals',
      price: 699,
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
      specs: '80% layout, wireless/wired dual mode',
      compatible: true
    },
    {
      id: '6',
      name: 'Logitech MX Master 3S Mouse',
      category: 'Peripherals',
      price: 799,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      specs: '8000 DPI sensor',
      compatible: true
    }
  ];

  return baseProducts;
};

export function ConfigurationReview({ config, onBack, onProceedToPurchase }: ConfigurationReviewProps) {
  const [products, setProducts] = useState<Product[]>(generateProducts(config));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const compatibilityScore = Math.round((products.filter(p => p.compatible).length / products.length) * 100);
  const incompatibleProducts = products.filter(p => !p.compatible);

  const handleSwapProduct = (productId: string) => {
    // Simulate swapping with a compatible alternative
    setProducts(products.map(p => {
      if (p.id === productId) {
        if (p.id === '2') {
          return {
            ...p,
            name: 'IKEA MARKUS Office Chair',
            price: 1299,
            specs: 'Adjustable height, mesh backrest',
            compatible: true,
            issue: undefined
          };
        } else if (p.id === '4') {
          return {
            ...p,
            name: 'AmazonBasics Monitor Arm',
            price: 299,
            specs: 'Single arm, suitable for small spaces',
            compatible: true,
            issue: undefined
          };
        }
      }
      return p;
    }));
  };

  const styleNames = {
    minimal: 'Minimalist',
    modern: 'Modern',
    cyberpunk: 'Cyberpunk',
    warm: 'Warm & Cozy',
    industrial: 'Industrial',
    scandinavian: 'Scandinavian'
  };

  const purposeNames = {
    work: 'Work Optimized',
    gaming: 'Gaming Optimized',
    balanced: 'Balanced',
    creative: 'Creative Work'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Reconfigure
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Compatibility Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  compatibilityScore === 100 ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  {compatibilityScore === 100 ? (
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-amber-600" />
                  )}
                </div>
                <div>
                  <h2>Compatibility Score: {compatibilityScore}%</h2>
                  {compatibilityScore === 100 ? (
                    <p className="text-neutral-600">All products are fully compatible, ready to purchase</p>
                  ) : (
                    <p className="text-neutral-600">
                      {incompatibleProducts.length} compatibility issues found, recommend review and replacement
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Total Price</p>
                <p className="text-neutral-900">¥{totalPrice.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">
                  Budget: ¥{config.budget.toLocaleString()}
                  {totalPrice > config.budget && (
                    <span className="text-red-600 ml-2">Exceeds Budget</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Visual Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Plan Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                      <p className="text-neutral-500">3D Render Preview</p>
                      <p className="text-sm text-neutral-400 mt-2">
                        {config.spaceWidth}cm × {config.spaceDepth}cm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Space Dimensions</span>
                    <span>{config.spaceWidth}cm × {config.spaceDepth}cm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Purpose</span>
                    <span>{purposeNames[config.purpose as keyof typeof purposeNames]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Style</span>
                    <span>{styleNames[config.style as keyof typeof styleNames]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            <h3>Configuration List</h3>
            
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`${!product.compatible ? 'border-red-300 bg-red-50/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{product.name}</h4>
                            {!product.compatible && (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <p>¥{product.price.toLocaleString()}</p>
                      </div>
                      
                      <p className="text-sm text-neutral-600 mb-2">{product.specs}</p>

                      {product.issue && (
                        <Alert className="mb-2 border-red-300 bg-red-50">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <AlertDescription className="text-sm text-red-800">
                            {product.issue}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Category</span>
                                  <span>{product.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Price</span>
                                  <span>¥{product.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Specs</span>
                                  <span>{product.specs}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Compatibility</span>
                                  <span className={product.compatible ? 'text-green-600' : 'text-red-600'}>
                                    {product.compatible ? 'Compatible' : 'Incompatible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {!product.compatible && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSwapProduct(product.id)}
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Swap Product
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Purchase Button */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>Ready to Buy?</h3>
                    <p className="text-neutral-600">
                      {compatibilityScore === 100 
                        ? 'All product compatibility checks passed'
                        : 'Recommend resolving compatibility issues first'}
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => onProceedToPurchase(products)}
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-900"
                    disabled={compatibilityScore < 100}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Purchase Links
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
