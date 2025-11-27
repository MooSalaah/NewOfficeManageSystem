'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

{/* Summary Cards */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalIncome.toLocaleString()} ر.س</div>
                        <p className="text-xs text-muted-foreground mt-1">من الفواتير المدفوعة</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} ر.س</div>
                        <p className="text-xs text-muted-foreground mt-1">مصاريف تشغيلية ورواتب</p>
                    </CardContent>
                </Card>
                <Card className={`border-t-4 ${netProfit >= 0 ? 'border-t-blue-500' : 'border-t-orange-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{netProfit.toLocaleString()} ر.س</div>
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
                                                <p className="font-bold">{invoice.amount.toLocaleString()} ر.س</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                                                        {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'overdue' ? 'متأخرة' : 'معلقة'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(invoice.dueDate), 'dd MMM', { locale: arSA })}
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
                                                <p className="font-bold text-red-600">-{expense.amount.toLocaleString()} ر.س</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(expense.date), 'dd MMM yyyy', { locale: arSA })}
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
        </div >
    );
}
