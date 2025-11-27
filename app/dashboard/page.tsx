'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { usePolling } from '@/hooks/usePolling';

import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export default function DashboardPage() {
    const { data, loading } = usePolling<any>('/api/dashboard', 30000);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-primary">لوحة التحكم</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">إجمالي المشاريع</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{data?.projectsCount || 0}</div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">نشط حالياً</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">العملاء</CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-200" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{data?.clientsCount || 0}</div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">مسجل في النظام</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">الإيرادات</CardTitle>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-200" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{data?.revenue?.toLocaleString() || 0} ر.س</div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">إجمالي الدخل</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">المهام المعلقة</CardTitle>
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
                            <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-200" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{data?.pendingTasks || 0}</div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">تحتاج إلى متابعة</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>نظرة عامة</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md text-muted-foreground">
                            مخطط الإيرادات (راجع قسم المالية للتفاصيل)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>النشاط الأخير</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">تم تحديث النظام</p>
                                    <p className="text-sm text-muted-foreground">جميع الوحدات تعمل بنجاح</p>
                                </div>
                                <div className="mr-auto font-medium text-xs text-muted-foreground">الآن</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
