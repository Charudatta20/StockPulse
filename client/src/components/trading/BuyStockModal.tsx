import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const buyOrderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(["market", "limit"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().optional(),
});

type BuyOrderForm = z.infer<typeof buyOrderSchema>;

interface BuyStockModalProps {
  stock: {
    id: string;
    symbol: string;
    name: string;
    currency: string;
    currentPrice?: {
      price: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyStockModal({ stock, isOpen, onClose }: BuyStockModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderType, setOrderType] = useState<"market" | "limit">("market");

  const form = useForm<BuyOrderForm>({
    resolver: zodResolver(buyOrderSchema),
    defaultValues: {
      symbol: stock?.symbol || "",
      type: "market",
      quantity: 1,
      price: stock?.currentPrice ? parseFloat(stock.currentPrice.price) : undefined,
    },
  });

  const buyMutation = useMutation({
    mutationFn: async (data: BuyOrderForm) => {
      const orderData = {
        ...data,
        side: "buy" as const,
        price: orderType === "market" ? undefined : data.price,
      };
      return apiRequest('/api/orders', 'POST', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: `Successfully placed buy order for ${form.getValues("quantity")} shares of ${stock?.symbol}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BuyOrderForm) => {
    buyMutation.mutate(data);
  };

  const currentPrice = stock?.currentPrice ? parseFloat(stock.currentPrice.price) : 0;
  const quantity = form.watch("quantity") || 0;
  const price = orderType === "market" ? currentPrice : (form.watch("price") || 0);
  const totalCost = quantity * price;

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {stock?.symbol}</DialogTitle>
          <DialogDescription>
            {stock?.name} • Current Price: {stock?.currency && currentPrice ? formatCurrency(currentPrice, stock.currency) : "N/A"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setOrderType(value as "market" | "limit");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="Number of shares"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {orderType === "limit" && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Price per share"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Order Type:</span>
                <span className="font-medium capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                <span className="font-medium">{quantity} shares</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price per share:</span>
                <span className="font-medium">
                  {stock?.currency && price ? formatCurrency(price, stock.currency) : "N/A"}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-semibold text-lg">
                    {stock?.currency && totalCost ? formatCurrency(totalCost, stock.currency) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={buyMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {buyMutation.isPending ? "Placing Order..." : `Buy ${stock?.symbol}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}