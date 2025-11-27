'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Loader2, Phone, Mail, Building } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Client {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    companyName?: string;
    address?: string;
    notes?: string;
}

export default function ClientsPage() {
    const { data: clients = [], isLoading: loading } = useSWR<Client[]>('/api/clients', fetcher);
    const [search, setSearch] = useState('');
    const [isNewClientOpen, setIsNewClientOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        notes: ''
    });

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient),
            });

            if (res.ok) {
                setIsNewClientOpen(false);
                mutate('/api/clients');
                setNewClient({
                    name: '',
                    email: '',
                    phone: '',
                    companyName: '',
                    address: '',
                    notes: ''
                });
            }
        } catch (error) {
            console.error('Error creating client', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">العملاء</h2>
                <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            عميل جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>إضافة عميل جديد</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateClient} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">الاسم الكامل</Label>
                                <Input
                                    id="name"
                                    required
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input
                                        id="phone"
                                        required
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">اسم الشركة / الجهة</Label>
                                <Input
                                    id="company"
                                    value={newClient.companyName}
                                    onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">العنوان</Label>
                                <Input
                                    id="address"
                                    value={newClient.address}
                                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">ملاحظات</Label>
                                <Textarea
                                    id="notes"
                                    value={newClient.notes}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsNewClientOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ العميل'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن عميل بالاسم أو الهاتف..."
                        className="pr-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">الشركة</TableHead>
                            <TableHead className="text-right">معلومات الاتصال</TableHead>
                            <TableHead className="text-right">العنوان</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    لا يوجد عملاء
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client._id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {client.name.charAt(0)}
                                            </div>
                                            {client.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.companyName && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Building className="w-4 h-4" />
                                                {client.companyName}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-3 h-3 text-muted-foreground" />
                                                <span dir="ltr">{client.phone}</span>
                                            </div>
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span dir="ltr">{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.address || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
