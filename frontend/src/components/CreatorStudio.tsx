import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Package,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Trash2,
  Tag,
  Search,
  Edit2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { templateService, productService, type Product, type ProductCreate } from '../lib/api';
import { toast } from 'sonner';
import { authService } from '../lib/auth';

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

export function CreatorStudio({ onBack }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'products'>('dashboard');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Create template state
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    style: '',
    image: '',
    items: [] as { productId: string; x: number; y: number }[]
  });

  const [enableTagging, setEnableTagging] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tempClickPosition, setTempClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [newProduct, setNewProduct] = useState<ProductCreate>({
    name: '',
    price: 0,
    category_id: 1, // Default category
    brand: '',
    image_url: '',
    currency: 'CNY'
  });

  const totalEarnings = templates.reduce((sum, t) => sum + t.earnings, 0);
  const totalViews = templates.reduce((sum, t) => sum + t.views, 0);
  const totalClicks = templates.reduce((sum, t) => sum + t.clicks, 0);

  // Fetch my templates from backend
  const fetchMyTemplates = async () => {
    try {
      const allTemplates = await templateService.getTemplates(0, 50);
      const myProfile = await authService.getProfile();
      const myTemplates = allTemplates.filter(t => t.creator?.id === myProfile.id).map(t => ({
        id: t.id.toString(),
        title: t.title,
        image: t.cover_image_url || '',
        views: t.views,
        clicks: t.clicks,
        earnings: 0,
        status: 'published' as const
      }));
      setTemplates(myTemplates);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchMyTemplates();
    fetchProducts();
  }, [activeTab]);

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        title: newTemplate.title,
        description: newTemplate.description,
        style: newTemplate.style,
        cover_image_url: newTemplate.image,
        items: newTemplate.items.map(item => ({
          product_id: parseInt(item.productId),
          position_x: item.x,
          position_y: item.y
        }))
      };

      if (editingTemplateId) {
        await templateService.updateTemplate(editingTemplateId, templateData);
        toast.success('Template updated successfully!');
      } else {
        await templateService.createTemplate(templateData);
        toast.success('Template published successfully!');
      }

      setNewTemplate({
        title: '',
        description: '',
        style: '',
        image: '',
        items: []
      });
      setEditingTemplateId(null);
      setActiveTab('dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const template = await templateService.getTemplate(id);
      setNewTemplate({
        title: template.title,
        description: template.description || '',
        style: template.style,
        image: template.cover_image_url || '',
        items: template.items.map(item => ({
          productId: item.product.id.toString(),
          x: item.position_x,
          y: item.position_y
        }))
      });
      setEditingTemplateId(id);
      setActiveTab('create');
    } catch (error: any) {
      toast.error("Failed to load template for editing");
    }
  };

  const handleCancelEdit = () => {
    setNewTemplate({
      title: '',
      description: '',
      style: '',
      image: '',
      items: []
    });
    setEditingTemplateId(null);
    setActiveTab('dashboard');
  };

  // Image Upload Logic
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    if (!newTemplate.image) {
      fileInputRef.current?.click();
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!newTemplate.image || !enableTagging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempClickPosition({ x, y });
    setShowTagDialog(true);
  };

  const handleAddTag = (productId: string) => {
    if (tempClickPosition) {
      setNewTemplate({
        ...newTemplate,
        items: [...newTemplate.items, { productId, ...tempClickPosition }]
      });
      setTempClickPosition(null);
      setShowTagDialog(false);
      toast.success('Product tagged!');
    }
  };

  const handleCreateProduct = async () => {
    try {
      const product = await productService.createProduct(newProduct);
      setProducts([product, ...products]); // Add to local list
      handleAddTag(product.id.toString()); // Automatically tag it
      setNewProduct({ // Reset form
        name: '',
        price: 0,
        category_id: 1,
        brand: '',
        image_url: '',
        currency: 'CNY'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTemplate({ ...newTemplate, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templateService.deleteTemplate(parseInt(id));
      toast.success('Template deleted');
      fetchMyTemplates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

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
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
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

            {/* Templates grid */}
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
                    <Card key={template.id} className="overflow-hidden group">
                      <div className="relative aspect-video">
                        <ImageWithFallback
                          src={template.image}
                          alt={template.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                            {template.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <button
                          className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="absolute bottom-2 right-12 p-2 bg-white/90 rounded-full text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                          onClick={(e) => handleEditTemplate(template.id, e)}
                          title="Edit Template"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
                <CardTitle>{editingTemplateId ? 'Edit Desk Setup Template' : 'Create New Desk Setup Template'}</CardTitle>
                <p className="text-neutral-600">
                  Fill in the information below to create your desk setup template.
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
                      placeholder="Introduce your desk setup philosophy..."
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

                {/* Upload Photo & Tagging */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Upload Photo</Label>
                    {newTemplate.image && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enable-tagging"
                          checked={enableTagging}
                          onCheckedChange={setEnableTagging}
                        />
                        <Label htmlFor="enable-tagging" className="text-sm text-neutral-600 cursor-pointer">Enable Tagging</Label>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div
                    onClick={newTemplate.image ? handleImageClick : handleClickUpload}
                    className={`border-2 border-dashed border-neutral-300 rounded-lg text-center hover:border-purple-400 transition-colors overflow-hidden relative group ${!newTemplate.image ? 'p-8 cursor-pointer' : (enableTagging ? 'cursor-crosshair' : 'cursor-default')}`}
                  >
                    {newTemplate.image ? (
                      <div className="relative inline-block w-full">
                        <img
                          src={newTemplate.image}
                          alt="Preview"
                          className="w-full max-h-[500px] object-contain"
                        />
                        {!newTemplate.image && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="text-white font-medium">Click image to add tags</p>
                          </div>
                        )}

                        {/* Render Tags */}
                        {newTemplate.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="absolute w-6 h-6 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            {idx + 1}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                        <p className="text-neutral-600 mb-2">Click to upload or drag image here</p>
                        <p className="text-sm text-neutral-500">Supports JPG, PNG, max 5MB</p>
                      </>
                    )}
                  </div>
                  {newTemplate.image && !enableTagging && (
                    <p className="text-sm text-neutral-500 mt-2 text-center">
                      Toggle "Enable Tagging" to add product tags to your image.
                    </p>
                  )}
                  {enableTagging && (
                    <p className="text-sm text-purple-600 mt-2 text-center flex items-center justify-center gap-1">
                      <Tag className="w-4 h-4" /> Click anywhere on the image to tag a product.
                    </p>
                  )}
                </div>

                {/* Product List (Read Only) */}
                <div className="space-y-2">
                  <Label>Selected Products</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {newTemplate.items.length === 0 ? (
                      <p className="text-sm text-neutral-500 col-span-2 text-center py-4">No products tagged yet</p>
                    ) : (
                      newTemplate.items.map((item, idx) => {
                        // Safe implementation to handle id types (number vs string)
                        const product = products.find(p => p.id.toString() === item.productId);
                        if (!product) return null;
                        return (
                          <Card key={idx} className="relative">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{product.name}</p>
                                  <p className="text-sm text-neutral-500">¥{product.price}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const newItems = [...newTemplate.items];
                                    newItems.splice(idx, 1);
                                    setNewTemplate({ ...newTemplate, items: newItems });
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-neutral-400 hover:text-purple-600"
                                  onClick={() => {
                                    setNewProduct({
                                      name: product.name,
                                      price: product.price,
                                      brand: product.brand || '',
                                      image_url: product.image_url || '',
                                      category_id: 1,
                                      currency: product.currency,
                                      specs: product.specs
                                    });
                                    setEditingProductId(product.id);
                                    setIsProductDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!newTemplate.title || newTemplate.items.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplateId ? 'Update Template' : 'Save & Publish'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tagging Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tag Product</DialogTitle>
            <DialogDescription>
              Select an existing product or add a new one for this tag.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="select">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Existing</TabsTrigger>
              <TabsTrigger value="new">Create New</TabsTrigger>
            </TabsList>
            <TabsContent value="select" className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 hover:bg-neutral-100 rounded cursor-pointer border"
                    onClick={() => handleAddTag(p.id.toString())}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleAddTag(p.id.toString())}
                    >
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">¥{p.price}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-neutral-400 hover:text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewProduct({
                            name: p.name,
                            price: p.price,
                            brand: p.brand || '',
                            image_url: p.image_url || '',
                            category_id: 1,
                            currency: p.currency,
                            specs: p.specs
                          });
                          setEditingProductId(p.id);
                          setIsProductDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-sm text-neutral-500 py-4">No products found.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="new" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (CNY)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price === 0 ? '' : newProduct.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNewProduct({ ...newProduct, price: isNaN(val) ? 0 : val });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-4">
                    {newProduct.image_url && (
                      <div className="w-16 h-16 rounded border overflow-hidden relative">
                        <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewProduct({ ...newProduct, image_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <p className="text-xs text-neutral-500 mt-1">Upload a product image (optional)</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateProduct}
                  disabled={!newProduct.name || newProduct.price <= 0}
                  className="w-full"
                >
                  Create & Tag
                </Button>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Products</CardTitle>
                      <CardDescription>Manage your product library and assets.</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setNewProduct({
                        name: '',
                        price: 0,
                        category_id: 1, // Default
                        brand: '',
                        image_url: '',
                        currency: 'CNY'
                      });
                      setEditingProductId(null);
                      setIsProductDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden group relative">
                        <div className="aspect-square bg-neutral-100 relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-neutral-400">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setNewProduct({
                                  name: product.name,
                                  price: product.price,
                                  brand: product.brand || '',
                                  image_url: product.image_url || '',
                                  category_id: 1, // Default or fetch
                                  currency: product.currency
                                });
                                setEditingProductId(product.id);
                                setIsProductDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium truncate" title={product.name}>{product.name}</h3>
                          <p className="text-sm text-neutral-500">{product.brand}</p>
                          <p className="text-sm font-semibold mt-1">¥{product.price}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Product Edit/Create Dialog */}
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="prod-name">Name</Label>
                  <Input
                    id="prod-name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prod-price">Price</Label>
                    <Input
                      id="prod-price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prod-brand">Brand</Label>
                    <Input
                      id="prod-brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-4">
                    {newProduct.image_url ? (
                      <div className="w-20 h-20 relative rounded overflow-hidden border">
                        <img src={newProduct.image_url} className="w-full h-full object-cover" />
                        <button
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100"
                          onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-neutral-100 rounded border flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewProduct({ ...newProduct, image_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <p className="text-xs text-neutral-500 mt-1">Upload product image</p>
                    </div>
                  </div>
                </div>
                <Button onClick={async () => {
                  try {
                    if (editingProductId) {
                      await productService.updateProduct(editingProductId, newProduct);
                      toast.success('Product updated!');
                    } else {
                      await productService.createProduct(newProduct);
                      toast.success('Product created!');
                    }
                    setIsProductDialogOpen(false);
                    fetchProducts(); // Refresh list
                  } catch (e) {
                    toast.error('Failed to save product');
                  }
                }}>
                  {editingProductId ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </DialogContent>
      </Dialog >
    </div >
  );
}
