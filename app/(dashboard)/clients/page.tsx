'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, MapPin, Edit, Trash2, User } from 'lucide-react';
import { ClientDialog } from '@/components/clients/client-dialog';
import { Badge } from '@/components/ui/badge';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">العملاء</h2>
                    <p className="text-muted-foreground mt-1">إدارة بيانات العملاء ومتابعة مشاريعهم</p>
                </div>
                <ClientDialog onClientSaved={fetchClients} />
            </div>

            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm max-w-md">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="بحث باسم العميل أو رقم الجوال..."
                    className="border-0 focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                    <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium text-muted-foreground">لا يوجد عملاء</h3>
                    <p className="text-sm text-muted-foreground/70">أضف عميل جديد للبدء</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <Card key={client._id} className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{client.name}</CardTitle>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                {client.projectCount || 0} مشاريع
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <ClientDialog
                                    clientToEdit={client}
                                    onClientSaved={fetchClients}
                                    trigger={
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    }
                                />
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4 text-primary/70" />
                                    <span dir="ltr">{client.phone}</span>
                                </div>
                                {client.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary/70" />
                                        <span>{client.email}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-primary/70" />
                                        <span>{client.address}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
