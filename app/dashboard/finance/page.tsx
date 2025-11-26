'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Loader2, FileText } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/finance');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTransaction,
                    amount: Number(newTransaction.amount)
                }),
            });

            if (res.ok) {
                setIsNewTransactionOpen(false);
                fetchData();
                setNewTransaction({
                    type: 'expense',
                    amount: '',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error creating transaction', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">المالية</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard/finance/invoices'}>
                        <FileText className="w-4 h-4 ml-2" />
                        إدارة الفواتير
                    </Button>
                    <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                تسجيل عملية
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>تسجيل عملية مالية جديدة</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTransaction} className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">نوع العملية</Label>
                                        <Select
                                            value={newTransaction.type}
                                            onValueChange={(val) => setNewTransaction({ ...newTransaction, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">إيراد (دخل)</SelectItem>
                                                <SelectItem value="expense">مصروف</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">المبلغ (ر.س)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            required
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">التصنيف</Label>
                                    <Input
                                        id="category"
                                        placeholder="مثال: رواتب، إيجار، دفعة مشروع..."
                                        required
                                        value={newTransaction.category}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">التاريخ</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        required
                                        value={newTransaction.date}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">الوصف</Label>
                                    <Input
                                        id="description"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsNewTransactionOpen(false)}>إلغاء</Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data?.stats.income.toLocaleString()} ر.س</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data?.stats.expenses.toLocaleString()} ر.س</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data?.stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {data?.stats.netProfit.toLocaleString()} ر.س
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>التحليل المالي (آخر 6 أشهر)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.chartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="income" name="إيرادات" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="مصروفات" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>آخر العمليات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">البيان</TableHead>
                                    <TableHead className="text-right">المبلغ</TableHead>
                                    <TableHead className="text-right">التاريخ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.transactions.map((t: any) => (
                                    <TableRow key={t._id}>
                                        <TableCell>
                                            <div className="font-medium">{t.category}</div>
                                            <div className="text-xs text-muted-foreground">{t.description || '-'}</div>
                                        </TableCell>
                                        <TableCell className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(t.date), 'dd MMM', { locale: arSA })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
