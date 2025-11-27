'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, UserCheck, UserX, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export default function HRPage() {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [todayStats, setTodayStats] = useState({ present: 0, absent: 0, late: 0 });

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/attendance');
            if (res.ok) {
                const data = await res.json();
                setAttendance(data);

                // Calculate stats
                const present = data.filter((a: any) => a.status === 'present').length;
                const late = data.filter((a: any) => a.status === 'late').length;
                // Absent logic would require comparing against total employees, simplified here
                setTodayStats({ present, late, absent: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleAttendance = async (action: 'check-in' | 'check-out') => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                fetchAttendance();
            } else {
                const err = await res.json();
                alert(err.error); // Simple alert for demo
            }
        } catch (error) {
            console.error('Error in attendance action', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">الموارد البشرية والحضور</h2>
                <div className="flex gap-4">
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                        onClick={() => handleAttendance('check-in')}
                        disabled={actionLoading}
                    >
                        <LogIn className="w-5 h-5" />
                        تسجيل دخول
                    </Button>
                    <Button
                        size="lg"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => handleAttendance('check-out')}
                        disabled={actionLoading}
                    >
                        <LogOut className="w-5 h-5" />
                        تسجيل خروج
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">حضور اليوم</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.present}</div>
                        <p className="text-xs text-muted-foreground">موظف متواجد حالياً</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">تأخير</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.late}</div>
                        <p className="text-xs text-muted-foreground">موظف متأخر</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">غياب</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">لم يتم احتساب الغياب بعد</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>سجل الحضور اليومي ({format(new Date(), 'dd MMM yyyy', { locale: arSA })})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الموظف</TableHead>
                                <TableHead className="text-right">وقت الدخول</TableHead>
                                <TableHead className="text-right">وقت الخروج</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        لا توجد سجلات حضور اليوم
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendance.map((record) => (
                                    <TableRow key={record._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {record.user?.name?.charAt(0) || '?'}
                                                </div>
                                                {record.user?.name || 'مستخدم غير معروف'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(record.checkIn), 'hh:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                                                {record.status === 'present' ? 'حاضر' : record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
