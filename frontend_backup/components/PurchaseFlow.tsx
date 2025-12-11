import { ExternalLink, ShoppingBag, Store } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
}

interface PurchaseFlowProps {
  products: Product[];
  onBack: () => void;
}

const getPurchaseLinks = (product: Product) => {
  const links = [
    { platform: 'Amazon', url: '#', commission: 5 },
    { platform: 'JD.com', url: '#', commission: 4 },
  ];

  if (product.name.includes('Herman Miller')) {
    links.unshift({ platform: 'Herman Miller Official', url: '#', commission: 8 });
  } else if (product.name.includes('Keychron')) {
    links.unshift({ platform: 'Keychron Official', url: '#', commission: 10 });
  } else if (product.name.includes('IKEA')) {
    links.unshift({ platform: 'IKEA Official', url: '#', commission: 3 });
  }

  return links;
};

export function PurchaseFlow({ products, onBack }: PurchaseFlowProps) {
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2>Purchase Links</h2>
            <Button variant="outline" onClick={onBack}>
              Back to Configuration
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Info Alert */}
        <Alert className="mb-6 border-amber-300 bg-amber-50">
          <ShoppingBag className="w-4 h-4 text-amber-600" />
          <AlertDescription>
            <p className="text-amber-900">
              We will direct you to our partner websites to complete your purchase. DeskHub is an aggregator platform supported by partner commissions.
            </p>
          </AlertDescription>
        </Alert>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Items</span>
                <span>{products.length} items</span>
              </div>
              <Separator />
              <div className="flex justify-between pt-2">
                <span>Estimated Total</span>
                <span className="text-neutral-900">¥{totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-neutral-500 pt-2">
                * Actual prices subject to platform prices, may vary due to promotions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Purchase Links */}
        <div className="space-y-6">
          <h3>Product Purchase Links</h3>
          
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{product.name}</span>
                  <Badge variant="outline">{product.category}</Badge>
                </CardTitle>
                <p className="text-sm text-neutral-600 mt-1">{product.specs}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                    <Store className="w-4 h-4" />
                    <span>Available Platforms:</span>
                  </div>
                  
                  <div className="grid gap-2">
                    {getPurchaseLinks(product).map((link, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                            <Store className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div>
                            <p>{link.platform}</p>
                            <p className="text-sm text-neutral-500">¥{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* One-Click Buy All */}
        <Card className="mt-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">One-Click Buy All Products</h3>
                <p className="text-neutral-600">
                  We will open all purchase links in new windows, you can complete purchases on each platform
                </p>
              </div>
              <Button 
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-neutral-900"
                onClick={() => {
                  products.forEach(product => {
                    getPurchaseLinks(product).forEach(link => {
                      window.open(link.url, '_blank');
                    });
                  });
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Open All Purchase Links
              </Button>
            </div>
            <p className="text-sm text-neutral-500 mt-4">
              Note: Please allow pop-ups in your browser
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
