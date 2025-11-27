'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Calendar, ClipboardList } from 'lucide-react';

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/tasks');
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error('Failed to fetch tasks', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default'; // or 'warning' if we had it
            case 'low': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'success'; // We might need to define success variant or use green class
            case 'in_progress': return 'default';
            case 'review': return 'warning';
            default: return 'secondary';
        }
    };

    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            'todo': 'قيد الانتظار',
            'in_progress': 'جاري العمل',
            'review': 'مراجعة',
            'done': 'مكتمل'
        };
        return map[status] || status;
    };

    const translatePriority = (priority: string) => {
        const map: Record<string, string> = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية'
        };
        return map[priority] || priority;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <ClipboardList className="w-8 h-8" />
                    إدارة المهام
                </h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المهام</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">المهمة</TableHead>
                                <TableHead className="text-right">المشروع</TableHead>
                                <TableHead className="text-right">الأولوية</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="text-right">المسؤول</TableHead>
                                <TableHead className="text-right">تاريخ التسليم</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا يوجد مهام حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => (
                                    <TableRow key={task._id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{task.title}</span>
                                                {task.description && (
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{task.project?.title || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getPriorityColor(task.priority) as any}>
                                                {translatePriority(task.priority)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {translateStatus(task.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {task.assignee ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={task.assignee.avatar} />
                                                        <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{task.assignee.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : '-'}
                                            </div>
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
