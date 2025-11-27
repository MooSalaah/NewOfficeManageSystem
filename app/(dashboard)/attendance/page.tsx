'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export default function AttendancePage() {
    const [history, setHistory] = useState<any[]>([]);
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/attendance');
            if (res.ok) {
                const data = await res.json();
                setHistory(Array.isArray(data.history) ? data.history : []);
                setTodayRecord(data.today);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAction = async (action: 'check-in' | 'check-out') => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                await fetchAttendance();
            }
        } catch (error) {
            console.error('Error processing attendance:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const isCheckedIn = !!todayRecord;
    const isCheckedOut = !!todayRecord?.checkOut;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">الحضور والانصراف</h2>
                    <p className="text-muted-foreground mt-1">تسجيل ومتابعة ساعات العمل</p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-xl font-mono font-bold" dir="ltr">
                        {format(currentTime, 'HH:mm:ss')}
                    </span>
                    <span className="text-sm text-muted-foreground border-r pr-2 mr-2">
                        {format(currentTime, 'EEEE, d MMMM', { locale: arSA })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action Card */}
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle>تسجيل اليوم</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isCheckedOut ? 'border-gray-200 bg-gray-50' : isCheckedIn ? 'border-green-100 bg-green-50' : 'border-blue-100 bg-blue-50'}`}>
                            {isCheckedOut ? (
                                <CheckCircle2 className="w-16 h-16 text-gray-400" />
                            ) : isCheckedIn ? (
                                <LogIn className="w-16 h-16 text-green-600" />
                            ) : (
                                <Clock className="w-16 h-16 text-blue-600" />
                            )}
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-bold">
                                {isCheckedOut ? 'تم الانصراف' : isCheckedIn ? 'تم تسجيل الدخول' : 'لم تسجل دخولك بعد'}
                            </h3>
                            {isCheckedIn && !isCheckedOut && (
                                <p className="text-muted-foreground">
                                    وقت الدخول: {format(new Date(todayRecord.checkIn), 'hh:mm a')}
                                </p>
                            )}
                        </div>

                        {!isCheckedOut && (
                            <Button
                                size="lg"
                                className={`w-full max-w-xs h-12 text-lg gap-2 ${isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                onClick={() => handleAction(isCheckedIn ? 'check-out' : 'check-in')}
                                disabled={actionLoading}
                            >
                                {isCheckedIn ? (
                                    <>
                                        <LogOut className="w-5 h-5" />
                                        تسجيل انصراف
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        تسجيل دخول
                                    </>
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* History Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>سجل الحضور (آخر 30 يوم)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />)}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">لا يوجد سجل حضور</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((record) => (
                                    <div key={record._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {format(new Date(record.date), 'EEEE, d MMMM', { locale: arSA })}
                                                </p>
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <LogIn className="w-3 h-3" />
                                                        {format(new Date(record.checkIn), 'hh:mm a')}
                                                    </span>
                                                    {record.checkOut && (
                                                        <span className="text-red-600 flex items-center gap-1 border-r pr-2 mr-2">
                                                            <LogOut className="w-3 h-3" />
                                                            {format(new Date(record.checkOut), 'hh:mm a')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={record.status === 'late' ? 'destructive' : 'secondary'}>
                                            {record.status === 'present' ? 'حاضر' : record.status === 'late' ? 'متأخر' : record.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
