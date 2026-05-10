'use client';

import { useGetCustomersQuery } from '@/store/apiSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
  const { data: customers, isLoading } = useGetCustomersQuery({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Customer
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers?.map((customer: any) => (
              <div key={customer.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{customer.email}</p>
                {customer.phone && <p className="text-sm">{customer.phone}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}