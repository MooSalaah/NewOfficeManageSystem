'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, DollarSign, Users, Briefcase, ArrowLeft } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'on_hold': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'in_progress': return 'قيد التنفيذ';
            case 'on_hold': return 'متوقف';
            default: return 'جديد';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">المشاريع</h2>
                    <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع المشاريع الهندسية</p>
                </div>
                <CreateProjectDialog onProjectCreated={fetchProjects} />
            </div>

            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm max-w-md">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="بحث عن مشروع..."
                    className="border-0 focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium text-muted-foreground">لا يوجد مشاريع</h3>
                    <p className="text-sm text-muted-foreground/70">أضف مشروع جديد للبدء</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Card key={project._id} className="group hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-1">{project.title}</CardTitle>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {project.client?.name || 'عميل غير معروف'}
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(project.status)}>
                                        {getStatusText(project.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            الميزانية:
                                        </span>
                                        <span className="font-medium">{project.budget?.toLocaleString()} ر.س</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            تاريخ التسليم:
                                        </span>
                                        <span className="font-medium">
                                            {new Date(project.endDate).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>

                                    {project.manager && (
                                        <div className="pt-2 border-t mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">مدير المشروع:</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                                                    {project.manager.name.charAt(0)}
                                                </div>
                                                <span className="text-sm">{project.manager.name}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 mt-2 border-t flex justify-end">
                                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                                            التفاصيل
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
