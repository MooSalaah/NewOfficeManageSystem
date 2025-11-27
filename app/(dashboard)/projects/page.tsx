'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Project {
    _id: string;
    title: string;
    client: { name: string };
    status: string;
    budget: number;
    startDate: string;
    endDate: string;
    team: { name: string; avatar?: string }[];
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    // New Project Form State
    const [newProject, setNewProject] = useState({
        title: '',
        clientName: '', // Simplified for demo: just text input for now, ideally a select from Clients
        budget: '',
        startDate: '',
        endDate: '',
        status: 'new',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // 1. Create Client first (mock logic for demo, ideally select existing)
        // For this demo, we'll just assume we need to create a client or link one.
        // To make it simple and robust without full Client UI yet:
        // We will create a client on the fly or just send the name if the API handles it.
        // Let's update the API to handle "create client if not exists" or just use a dummy ID for now if we want to be quick,
        // BUT we should do it right.
        // Let's actually fetch clients or just allow typing a name and the backend finds/creates.

        // Actually, let's just send the data to a new endpoint that handles the "Quick Create" logic.
        // Or better, let's just make the API simple for now.

        try {
            // First create/find client
            const clientRes = await fetch('/api/clients/quick', {
                method: 'POST',
                body: JSON.stringify({ name: newProject.clientName, phone: '0000000000' }), // Dummy phone
            });
            const clientData = await clientRes.json();

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newProject.title,
                    client: clientData._id,
                    budget: Number(newProject.budget),
                    startDate: newProject.startDate,
                    endDate: newProject.endDate,
                    status: newProject.status,
                    description: newProject.description
                }),
            });

            if (res.ok) {
                setIsNewProjectOpen(false);
                fetchProjects();
                setNewProject({
                    title: '',
                    clientName: '',
                    budget: '',
                    startDate: '',
                    endDate: '',
                    status: 'new',
                    description: ''
                });
            }
        } catch (error) {
            console.error('Error creating project', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.client?.name.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge variant="secondary">جديد</Badge>;
            case 'in_progress': return <Badge className="bg-blue-500 hover:bg-blue-600">قيد التنفيذ</Badge>;
            case 'completed': return <Badge className="bg-green-500 hover:bg-green-600">مكتمل</Badge>;
            case 'on_hold': return <Badge variant="destructive">متوقف</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">المشاريع</h2>
                <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            مشروع جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>إضافة مشروع جديد</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">اسم المشروع</Label>
                                    <Input
                                        id="title"
                                        required
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client">العميل</Label>
                                    <Input
                                        id="client"
                                        placeholder="اسم العميل"
                                        required
                                        value={newProject.clientName}
                                        onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">الميزانية (ر.س)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        required
                                        value={newProject.budget}
                                        onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">الحالة</Label>
                                    <Select
                                        value={newProject.status}
                                        onValueChange={(val) => setNewProject({ ...newProject, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">جديد</SelectItem>
                                            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                            <SelectItem value="on_hold">متوقف</SelectItem>
                                            <SelectItem value="completed">مكتمل</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">تاريخ البداية</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        required
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">تاريخ النهاية</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        required
                                        value={newProject.endDate}
                                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">ملاحظات / وصف</Label>
                                <Textarea
                                    id="description"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsNewProjectOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ المشروع'}
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
                        placeholder="بحث عن مشروع أو عميل..."
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
                            <TableHead className="text-right">المشروع</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الميزانية</TableHead>
                            <TableHead className="text-right">تاريخ التسليم</TableHead>
                            <TableHead className="text-right">فريق العمل</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    لا توجد مشاريع مطابقة
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((project) => (
                                <TableRow key={project._id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{project.title}</TableCell>
                                    <TableCell>{project.client?.name || 'غير محدد'}</TableCell>
                                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                                    <TableCell>{project.budget.toLocaleString()} ر.س</TableCell>
                                    <TableCell>
                                        {project.endDate ? format(new Date(project.endDate), 'dd MMM yyyy', { locale: arSA }) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                            {project.team?.length > 0 ? project.team.map((member, i) => (
                                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )) : <span className="text-muted-foreground text-xs">لا يوجد</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
