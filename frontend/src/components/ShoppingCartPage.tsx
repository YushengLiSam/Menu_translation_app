import { Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
}

interface ShoppingCartPageProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
    onBack: () => void;
}

export function ShoppingCartPage({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onBack
}: ShoppingCartPageProps) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <p className="text-neutral-500 mb-4">Your cart is empty</p>
                    <Button onClick={onBack}>Continue Shopping</Button>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-4 flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-none">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">IMG</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{item.name}</h3>
                                        <p className="text-neutral-500">¥{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 border rounded-md">
                                            <button
                                                className="px-2 py-1 hover:bg-neutral-100 disabled:opacity-50"
                                                onClick={() => onUpdateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                className="px-2 py-1 hover:bg-neutral-100"
                                                onClick={() => onUpdateQuantity(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onRemoveItem(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="md:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Order Summary</h3>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Subtotal</span>
                                    <span>¥{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>¥{total.toLocaleString()}</span>
                                </div>
                                <Button className="w-full bg-neutral-900 hover:bg-neutral-800" size="lg" onClick={onCheckout}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Checkout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
