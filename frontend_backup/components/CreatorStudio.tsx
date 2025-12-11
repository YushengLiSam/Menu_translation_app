import { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  Package,
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Template {
  id: string;
  title: string;
  image: string;
  views: number;
  clicks: number;
  earnings: number;
  status: 'published' | 'draft';
}

interface CreatorStudioProps {
  onBack: () => void;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Minimalist Workspace',
    image: 'https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400',
    views: 12450,
    clicks: 890,
    earnings: 2156.50,
    status: 'published'
  },
  {
    id: '2',
    title: 'Gaming Battle Station',
    image: 'https://images.unsplash.com/photo-1594636797501-ef436e157819?w=400',
    views: 8920,
    clicks: 654,
    earnings: 1876.30,
    status: 'published'
  },
  {
    id: '3',
    title: 'Modern Office Space',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
    views: 3240,
    clicks: 182,
    earnings: 456.80,
    status: 'draft'
  }
];

const mockProducts = [
  { id: '1', name: 'Herman Miller Aeron Chair', price: 8999, category: 'Chair' },
  { id: '2', name: 'IKEA BEKANT Standing Desk', price: 2999, category: 'Desk' },
  { id: '3', name: 'LG 27" 4K Monitor', price: 2499, category: 'Monitor' },
  { id: '4', name: 'Keychron K8 Pro Keyboard', price: 699, category: 'Peripherals' },
  { id: '5', name: 'Logitech MX Master 3S', price: 799, category: 'Peripherals' }
];

export function CreatorStudio({ onBack }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');
  const [templates] = useState<Template[]>(mockTemplates);
  
  // Create template state
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    style: '',
    products: [] as string[]
  });

  const totalEarnings = templates.reduce((sum, t) => sum + t.earnings, 0);
  const totalViews = templates.reduce((sum, t) => sum + t.views, 0);
  const totalClicks = templates.reduce((sum, t) => sum + t.clicks, 0);

  const handleSaveTemplate = () => {
    alert('Template saved! In a real app, this would save to the backend database.');
    setNewTemplate({
      title: '',
      description: '',
      style: '',
      products: []
    });
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1>Creator Studio</h1>
              <p className="text-neutral-600 mt-1">
                Create desk setup templates, share your expertise, and earn commission income
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'dashboard' | 'create')}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Earnings</p>
                      <p className="mt-1 text-neutral-900">¥{totalEarnings.toLocaleString()}</p>
                      <Badge variant="secondary" className="mt-2">This Month</Badge>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Views</p>
                      <p className="mt-1 text-neutral-900">{totalViews.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Clicks</p>
                      <p className="mt-1 text-neutral-900">{totalClicks.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Template Count</p>
                      <p className="mt-1 text-neutral-900">{templates.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Templates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Templates</CardTitle>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <ImageWithFallback
                          src={template.image}
                          alt={template.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                            {template.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-3">{template.title}</h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-neutral-600">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Views</span>
                            </div>
                            <p className="mt-1">{template.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-neutral-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">Clicks</span>
                            </div>
                            <p className="mt-1">{template.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-neutral-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm">Earnings</span>
                            </div>
                            <p className="mt-1">¥{template.earnings.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Template Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Desk Setup Template</CardTitle>
                <p className="text-neutral-600">
                  Fill in the information below to create your desk setup template. Adding high-quality photos and detailed product lists will help users make decisions.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Minimalist Programmer Workspace"
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Introduce your desk setup philosophy, use cases, and advantages..."
                      rows={4}
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={newTemplate.style} onValueChange={(v) => setNewTemplate({ ...newTemplate, style: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimalist</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        <SelectItem value="warm">Warm & Cozy</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="scandinavian">Scandinavian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Upload Photo */}
                <div className="space-y-2">
                  <Label>Upload Photo</Label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                    <p className="text-neutral-600 mb-2">Click to upload or drag image here</p>
                    <p className="text-sm text-neutral-500">Supports JPG, PNG, max 5MB</p>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-2">
                  <Label>Select Products</Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    Choose products you recommend from the product library. You will earn commission each time a user purchases a product through your template.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {mockProducts.map((product) => (
                      <Card 
                        key={product.id}
                        className="cursor-pointer hover:border-purple-400 transition-colors"
                        onClick={() => {
                          const isSelected = newTemplate.products.includes(product.id);
                          setNewTemplate({
                            ...newTemplate,
                            products: isSelected
                              ? newTemplate.products.filter(id => id !== product.id)
                              : [...newTemplate.products, product.id]
                          });
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="mb-1">{product.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                <span className="text-sm text-neutral-600">¥{product.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              newTemplate.products.includes(product.id) 
                                ? 'bg-purple-600 border-purple-600' 
                                : 'border-neutral-300'
                            }`}>
                              {newTemplate.products.includes(product.id) && (
                                <div className="w-2 h-2 bg-white rounded-sm" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 mt-2">
                    {newTemplate.products.length} products selected
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveTab('dashboard')}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!newTemplate.title || newTemplate.products.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
