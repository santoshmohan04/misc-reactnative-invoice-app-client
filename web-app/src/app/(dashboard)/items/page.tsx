'use client';

import { useGetItemsQuery } from '@/store/apiSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ItemsPage() {
  const { data: items, isLoading } = useGetItemsQuery({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Items</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Item
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items?.map((item: any) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                <p className="font-bold">${item.price}</p>
                <p className="text-sm">Stock: {item.quantity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}