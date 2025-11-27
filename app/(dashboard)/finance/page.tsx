'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { InvoiceDialog } from '@/components/finance/invoice-dialog';

export default function FinancePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [invoicesRes, expensesRes] = await Promise.all([
                fetch('/api/finance/invoices'),
                fetch('/api/finance/expenses')
            ]);

            if (invoicesRes.ok) {
                const data = await invoicesRes.json();
                setInvoices(Array.isArray(data) ? data : []);
            }
            if (expensesRes.ok) {
                const data = await expensesRes.json();
                setExpenses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalIncome = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">المالية</h2>
                    <p className="text-muted-foreground mt-1">متابعة الفواتير والمصروفات والأرباح</p>
                </div>
                <div className="flex gap-2">
                    <InvoiceDialog onInvoiceSaved={fetchData} />
                    <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                        <Plus className="w-4 h-4" />
                        مصروف جديد
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalIncome || 0).toLocaleString()} ر.س</div>
                        <p className="text-xs text-muted-foreground mt-1">من الفواتير المدفوعة</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalExpenses || 0).toLocaleString()} ر.س</div>
                        <p className="text-xs text-muted-foreground mt-1">مصاريف تشغيلية ورواتب</p>
                    </CardContent>
                </Card>
                <Card className={`border-t-4 ${netProfit >= 0 ? 'border-t-blue-500' : 'border-t-orange-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(netProfit || 0).toLocaleString()} ر.س</div>
                        <p className="text-xs text-muted-foreground mt-1">الرصيد الحالي</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="invoices" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="invoices">الفواتير</TabsTrigger>
                    <TabsTrigger value="expenses">المصروفات</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل الفواتير</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />)}
                                </div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">لا توجد فواتير</div>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.map((invoice) => (
                                        <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{invoice.project?.title || 'مشروع غير محدد'}</p>
                                                    <p className="text-sm text-muted-foreground">{invoice.client?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold">{(Number(invoice.amount) || 0).toLocaleString()} ر.س</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                                                        {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'overdue' ? 'متأخرة' : 'معلقة'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM', { locale: arSA }) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل المصروفات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />)}
                                </div>
                            ) : expenses.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">لا توجد مصروفات</div>
                            ) : (
                                <div className="space-y-4">
                                    {expenses.map((expense) => (
                                        <div key={expense._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{expense.title}</p>
                                                    <p className="text-sm text-muted-foreground">{expense.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-red-600">-{(Number(expense.amount) || 0).toLocaleString()} ر.س</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {expense.date ? format(new Date(expense.date), 'dd MMM yyyy', { locale: arSA }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
