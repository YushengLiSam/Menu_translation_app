import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { templateService } from '../lib/api';
import { toast } from 'sonner';

interface SetupItem {
  id: string;
  name: string;
  price: number;
  x?: number;
  y?: number;
  image?: string;
  description?: string;
}

interface Setup {
  id: number;
  title: string;
  description?: string;
  image: string;
  kol: string;
  style: string;
  budget: string;
  items: SetupItem[];
}

const mockSetups: Setup[] = [
  {
    id: 1,
    title: 'Minimalist Workspace',
    description: 'A clean and productive setup focusing on essential tools.',
    image: 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZGVzayUyMHNldHVwfGVufDF8fHx8MTc2MjE1MTExNnww&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@minimalist_dev',
    style: 'Minimal',
    budget: 'Medium',
    items: [
      { id: '1', name: 'Herman Miller Monitor Arm', price: 299, x: 50, y: 50, description: 'High quality monitor arm', image: 'https://images.unsplash.com/photo-1596207047640-cdd73204944d?w=300' },
      { id: '2', name: 'Keychron K8 Mechanical Keyboard', price: 99, x: 30, y: 70, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300' },
      { id: '3', name: 'Bamboo Desk Organizer', price: 45, x: 80, y: 60, image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc5e?w=300' }
    ]
  },
  // ... (keep other mocks if needed, but for brevity relying on backend or these)
  {
    id: 2,
    title: 'Gaming Battle Station',
    image: 'https://images.unsplash.com/photo-1594636797501-ef436e157819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBkZXNrJTIwc2V0dXB8ZW58MXx8fHwxNzYyMTM3NjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@gaming_master',
    style: 'Cyberpunk',
    budget: 'High-end',
    items: [
      { id: '4', name: 'ROG 34" Curved Display', price: 899, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300' },
      { id: '5', name: 'Razer Mechanical Keyboard', price: 159, image: 'https://images.unsplash.com/photo-1588725835639-66952d7e5baf?w=300' },
      { id: '6', name: 'RGB Light Strip Kit', price: 49, image: 'https://images.unsplash.com/photo-1628178877526-7787e742c8d2?w=300' }
    ]
  },
  {
    id: 3,
    title: 'Modern Office Space',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyMTQ0MDcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@modern_workspace',
    style: 'Modern',
    budget: 'Medium',
    items: [
      { id: '7', name: 'LG 27" 4K Monitor', price: 449, image: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=300' },
      { id: '8', name: 'Logitech MX Keys', price: 119, image: 'https://images.unsplash.com/photo-1587829745563-8441d563ce78?w=300' },
      { id: '9', name: 'Desk Lamp', price: 79, image: 'https://images.unsplash.com/photo-1534073828943-f801091a7d58?w=300' }
    ]
  },
  {
    id: 4,
    title: 'Home Office Setup',
    image: 'https://images.unsplash.com/photo-1614598389565-8d56eddd2f48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlJTIwZGVza3xlbnwxfHx8fDE3NjIxNTc1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@home_office_pro',
    style: 'Cozy',
    budget: 'Medium',
    items: [
      { id: '10', name: 'IKEA Electric Standing Desk', price: 599, image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=300' },
      { id: '11', name: 'ErgoChair Pro', price: 399, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=300' },
      { id: '12', name: 'Laptop Stand', price: 49, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300' }
    ]
  },
  {
    id: 5,
    title: 'Creative Studio',
    image: 'https://images.unsplash.com/photo-1558477937-3e9e70fad118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkaW8lMjB3b3Jrc3BhY2UlMjBzZXR1cHxlbnwxfHx8fDE3NjIyMTYxODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@creative_space',
    style: 'Creative',
    budget: 'High-end',
    items: [
      { id: '13', name: 'Dell UltraSharp Dual Monitors', price: 1199, image: 'https://images.unsplash.com/photo-1544207765-92b5f6242e2c?w=300' },
      { id: '14', name: 'Wacom Drawing Tablet', price: 349, image: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=300' },
      { id: '15', name: 'Professional Audio System', price: 299, image: 'https://images.unsplash.com/photo-1558498522-6b637a78377c?w=300' }
    ]
  },
  {
    id: 6,
    title: 'Ergonomic Optimized',
    image: 'https://images.unsplash.com/photo-1713618502575-213ce1b24922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlcmdvbm9taWMlMjBkZXNrfGVufDF8fHx8MTc2MjIxNjE4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    kol: '@ergonomic_expert',
    style: 'Ergonomic',
    budget: 'High-end',
    items: [
      { id: '16', name: 'Herman Miller Aeron Chair', price: 1395, image: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?w=300' },
      { id: '17', name: 'Adjustable Monitor Arm', price: 199, image: 'https://images.unsplash.com/photo-1596207047640-cdd73204944d?w=300' },
      { id: '18', name: 'Anti-Fatigue Mat', price: 89, image: 'https://images.unsplash.com/photo-1616401784845-180882ba9cb8?w=300' }
    ]
  }
];

// Add to imports if needed, but simple interface update here:
import type { CartItem } from '../components/ShoppingCartPage';

interface DiscoveryPageProps {
  onStartConfiguration: () => void;
  onAddToCart?: (item: CartItem) => void;
}

export function DiscoveryPage({ onStartConfiguration, onAddToCart }: DiscoveryPageProps) {
  const [hoveredSetup, setHoveredSetup] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [setups, setSetups] = useState<Setup[]>(mockSetups);
  const [isLoading, setIsLoading] = useState(true);

  // New state for template detail dialog
  const [selectedTemplate, setSelectedTemplate] = useState<Setup | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SetupItem | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateService.getTemplates();
        // Map backend data to UI format
        const mappedSetups: Setup[] = data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || 'No description available',
          image: t.cover_image_url || 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=800', // Fallback
          kol: t.creator ? `@${t.creator.username}` : '@anonymous',
          style: t.style,
          budget: 'Medium', // Backend doesn't have budget yet, invoke default or calculate
          items: t.items.map(item => ({
            id: item.product.id.toString(),
            name: item.product.name,
            price: item.product.price,
            x: item.position_x,
            y: item.position_y,
            image: item.product.image_url,
            description: `Brand: ${item.product.brand || 'Generic'}. A high quality item for your desk setup.`
          }))
        }));
        setSetups([...mappedSetups, ...mockSetups]);
      } catch (error) {
        console.error("Failed to fetch templates", error);
        toast.error("Failed to load latest templates");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleProductClick = (item: SetupItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(item);
  };

  const addToCart = () => {
    if (selectedProduct && onAddToCart) {
      onAddToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        quantity: 1
      });
      setSelectedProduct(null); // Close dialog
      // Toast is handled in App.tsx now, or we can keep it here. App.tsx has it.
    } else {
      toast.success('Added to cart!');
      setSelectedProduct(null);
    }
  };

  const filteredSetups = setups.filter(setup => {
    const matchesStyle = selectedStyle === 'all' || setup.style === selectedStyle;
    const matchesBudget = selectedBudget === 'all' || setup.budget === selectedBudget;
    const matchesSearch = setup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setup.kol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStyle && matchesBudget && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Template Detail Dialog (Xiaohongshu Style) */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden h-[80vh]">
          {selectedTemplate && (
            <div className="flex h-full flex-col md:flex-row">
              {/* Left: Image with Tags */}
              <div className="relative bg-neutral-900 md:w-2/3 h-1/2 md:h-full flex items-center justify-center">
                <ImageWithFallback
                  src={selectedTemplate.image}
                  alt={selectedTemplate.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right: Info & Products */}
              <div className="flex-1 flex flex-col h-1/2 md:h-full bg-white">
                <div className="p-6 border-b flex-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-bold">
                      {selectedTemplate.kol[1].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedTemplate.kol}</p>
                      <p className="text-xs text-neutral-500">Suggested Workspace</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Follow</Button>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedTemplate.title}</h2>
                  <p className="text-neutral-600 text-sm">{selectedTemplate.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{selectedTemplate.style}</Badge>
                    <Badge variant="outline">{selectedTemplate.budget}</Badge>
                  </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <h3 className="font-semibold text-sm text-neutral-500 uppercase tracking-wider">Featured Products</h3>
                  {selectedTemplate.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors" onClick={(e) => handleProductClick(item, e)}>
                      <div className="w-12 h-12 bg-neutral-100 rounded flex-none overflow-hidden">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">IMG</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500">¥{item.price}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-purple-600">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t bg-neutral-50 flex-none">
                  <Button onClick={onStartConfiguration} className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-900 font-semibold" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Customize this Setup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[425px] z-50">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Product Details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-100 relative">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400">
                      Product Image
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold font-mono">¥{selectedProduct.price.toLocaleString()}</p>
                  <p className="text-neutral-600">
                    {selectedProduct.description || 'No description available.'}
                  </p>
                </div>
              </div>
              <Button onClick={addToCart} className="w-full bg-purple-600 hover:bg-purple-700">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span className="text-amber-400">DeskHub</span>
          </div>
          <h1 className="mb-4">From Inspiration to Execution, All-in-One Desk Setup Solution</h1>
          <p className="text-neutral-300 max-w-2xl mb-8">
            Discover high-quality desk setups from global KOLs, use AI configurator to generate your perfect workspace
          </p>
          <Button
            size="lg"
            onClick={onStartConfiguration}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-900"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Configuration
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search setups or KOL..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="Minimal">Minimal</SelectItem>
                  <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Cozy">Cozy</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Ergonomic">Ergonomic</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High-end">High-end</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="mb-6">Trending Setups</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSetups.map((setup) => (
            <Card
              key={setup.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onMouseEnter={() => setHoveredSetup(setup.id)}
              onMouseLeave={() => setHoveredSetup(null)}
              onClick={() => setSelectedTemplate(setup)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ImageWithFallback
                  src={setup.image}
                  alt={setup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />


                {/* Hover Overlay with Items */}
                {hoveredSetup === setup.id && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      {setup.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/95 backdrop-blur rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-neutral-50 transition-colors"
                          onClick={(e) => handleProductClick(item, e)}
                        >
                          <span className="text-sm text-neutral-900">{item.name}</span>
                          <span className="text-sm text-neutral-600">¥{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="mb-2">{setup.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{setup.kol}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{setup.style}</Badge>
                    <Badge variant="outline">{setup.budget}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSetups.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">No matching setups found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedStyle('all');
                setSelectedBudget('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
