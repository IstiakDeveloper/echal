import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import bangladeshAddresses from '@/data/bangladeshAddresses.json';

type DeliveryAmount = {
    id: number;
    division: string;
    district: string | null;
    upazila: string | null;
    amount: string;
    is_active: boolean;
};

type DeliveryAmountsIndexProps = {
    deliveryAmounts: {
        data: DeliveryAmount[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    divisions: string[];
    filters: { division?: string };
};

export default function DeliveryAmountsIndex({
    deliveryAmounts,
    divisions,
    filters,
}: DeliveryAmountsIndexProps) {
    const { divisions: allDivisions, districtsByDivision, upazilasByDistrict } = bangladeshAddresses as {
        divisions: string[];
        districtsByDivision: Record<string, string[]>;
        upazilasByDistrict: Record<string, string[]>;
    };

    const form = useForm({
        division: '',
        district: '',
        upazila: '',
        amount: '',
        is_active: true,
    });

    const [selectedDivision, setSelectedDivision] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');

    const divisionOptions = allDivisions;
    const districtOptions = selectedDivision ? districtsByDivision[selectedDivision] ?? [] : [];
    const upazilaOptions = selectedDistrict ? upazilasByDistrict[selectedDistrict] ?? [] : [];

    const handleDivisionChange = (value: string) => {
        setSelectedDivision(value);
        setSelectedDistrict('');
        form.setData('division', value);
        form.setData('district', '');
        form.setData('upazila', '');
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
        form.setData('district', value);
        form.setData('upazila', '');
    };

    const handleUpazilaChange = (value: string) => {
        form.setData('upazila', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/delivery-amounts', {
            onSuccess: () => {
                form.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this delivery amount?')) {
            router.delete(`/admin/delivery-amounts/${id}`);
        }
    };

    return (
        <>
            <Head title="Delivery Amounts — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Delivery Amounts</h1>
                        <p className="mt-1 text-muted-foreground">Manage delivery charges by location</p>
                    </div>

                    {/* Add New */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-2 text-lg font-semibold">Add Delivery Amount</h2>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Division-only = full division, District-only = full district, Upazila = specific upazila.
                        </p>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Division *</label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={selectedDivision}
                                    onChange={(e) => handleDivisionChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select division</option>
                                    {divisionOptions.map((div) => (
                                        <option key={div} value={div}>
                                            {div}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">District (optional)</label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={selectedDistrict}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    disabled={!selectedDivision}
                                >
                                    <option value="">
                                        {selectedDivision ? 'All districts in division' : 'Select division first'}
                                    </option>
                                    {districtOptions.map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Upazila (optional)</label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.upazila}
                                    onChange={(e) => handleUpazilaChange(e.target.value)}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">
                                        {selectedDistrict ? 'All upazilas in district' : 'Select district first'}
                                    </option>
                                    {upazilaOptions.map((upa) => (
                                        <option key={upa} value={upa}>
                                            {upa}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Amount (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.amount}
                                    onChange={(e) => form.setData('amount', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={form.processing} className="w-full">
                                    <Plus className="mr-2 size-4" />
                                    Add
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Filter */}
                    <div className="rounded-lg border border-border bg-card p-4">
                        <form method="get" className="flex gap-4">
                            <select
                                name="division"
                                defaultValue={filters.division || ''}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Divisions</option>
                                {divisionOptions.map((div) => (
                                    <option key={div} value={div}>
                                        {div}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit">Filter</Button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Division</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">District</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Upazila</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveryAmounts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No delivery amounts found
                                            </td>
                                        </tr>
                                    ) : (
                                        deliveryAmounts.data.map((da) => (
                                            <tr key={da.id} className="border-b border-border">
                                                <td className="px-4 py-3 font-medium">{da.division}</td>
                                                <td className="px-4 py-3 text-sm">{da.district || '—'}</td>
                                                <td className="px-4 py-3 text-sm">{da.upazila || '—'}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    ৳{parseFloat(da.amount).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                            da.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {da.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(da.id)}
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
