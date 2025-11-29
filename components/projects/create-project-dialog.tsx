'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, ArrowRight, ArrowLeft, Check, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const STANDARD_TASKS = [
    "رسم مخططات معمارية",
    "عمل فكرة مخطط معماري",
    "منظور 3D",
    "تقرير فني الكتروني",
    "رفع تقارير الاشراف",
    "تقرير سلامة فوري",
    "تقرير سلامة غير فوري",
    "رخصة تسوير",
    "قرار مساحي",
    "مخطط انشائي",
    "ربط الرخصة",
    "شهادة اشغال",
    "شهادة انهاء اعمال السلامة",
    "فرز",
    "مخطط طاقة استيعابية",
    "مخطط سلامة",
    "رفع الرخصة",
    "اضافة وتعديل مكونات البناء",
    "مطابقة مخططات السلامة",
    "الاشراف على الرخصة",
    "تقرير اسكان حجاج",
    "رخصة بناء",
    "رخصة هدم"
];

interface CreateProjectDialogProps {
    onProjectCreated: () => void;
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');

    const [formData, setFormData] = useState({
        title: '',
        clientId: '', // For existing client
        newClientName: '', // For new client
        newClientPhone: '', // For new client
        manager: '',
        budget: '',
        startDate: '',
        endDate: '',
        status: 'new',
        description: '',
        selectedTasks: [] as string[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, clientsRes] = await Promise.all([
                    fetch('/api/users'),
                    fetch('/api/clients')
                ]);

                if (usersRes.ok) {
                    const data = await usersRes.json();
                    setUsers(data);
                }
                if (clientsRes.ok) {
                    const data = await clientsRes.json();
                    setClients(data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        if (open) {
            fetchData();
        }
    }, [open]);

    const handleTaskToggle = (task: string) => {
        setFormData(prev => {
            if (prev.selectedTasks.includes(task)) {
                return { ...prev, selectedTasks: prev.selectedTasks.filter(t => t !== task) };
            } else {
                return { ...prev, selectedTasks: [...prev.selectedTasks, task] };
            }
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let finalClientId = formData.clientId;

            // 1. Create Client if needed
            if (clientMode === 'new') {
                const clientRes = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.newClientName,
                        phone: formData.newClientPhone
                    }),
                });

                if (!clientRes.ok) {
                    throw new Error('Failed to create client');
                }

                const clientData = await clientRes.json();
                finalClientId = clientData._id;
            } else {
                if (!finalClientId) {
                    alert('الرجاء اختيار عميل');
                    setSubmitting(false);
                    return;
                }
            }

            // 2. Create Project with Tasks
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    client: finalClientId,
                    manager: formData.manager,
                    budget: Number(formData.budget),
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    description: formData.description,
                    tasks: formData.selectedTasks
                }),
            });

            if (res.ok) {
                setOpen(false);
                setStep(1);
                setFormData({
                    title: '',
                    clientId: '',
                    newClientName: '',
                    newClientPhone: '',
                    manager: '',
                    budget: '',
                    startDate: '',
                    endDate: '',
                    status: 'new',
                    description: '',
                    selectedTasks: []
                });
                onProjectCreated();
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('حدث خطأ أثناء إنشاء المشروع');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    مشروع جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? 'بيانات المشروع (1/2)' : 'اختيار المهام (2/2)'}
                    </DialogTitle>
                    <div className="sr-only">
                        <p>نموذج لإنشاء مشروع جديد وتحديد المهام المرتبطة به.</p>
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    {step === 1 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">اسم المشروع</Label>
                                    <Input
                                        id="title"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="مثال: تصميم فيلا سكنية"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manager">مدير المشروع</Label>
                                    <Select
                                        value={formData.manager}
                                        onValueChange={(val) => setFormData({ ...formData, manager: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المسؤول" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 border p-4 rounded-lg bg-muted/10">
                                <Label className="mb-2 block">بيانات العميل</Label>
                                <Tabs defaultValue="existing" value={clientMode} onValueChange={(v) => setClientMode(v as any)} className="w-full" dir="rtl">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="existing" className="gap-2">
                                            <Users className="w-4 h-4" />
                                            عميل حالي
                                        </TabsTrigger>
                                        <TabsTrigger value="new" className="gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            عميل جديد
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="existing">
                                        <Select
                                            value={formData.clientId}
                                            onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر العميل من القائمة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client._id} value={client._id}>
                                                        {client.name} - {client.phone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TabsContent>

                                    <TabsContent value="new" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newClientName">اسم العميل</Label>
                                                <Input
                                                    id="newClientName"
                                                    value={formData.newClientName}
                                                    onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                                                    placeholder="الاسم الكامل"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newClientPhone">رقم الجوال</Label>
                                                <Input
                                                    id="newClientPhone"
                                                    value={formData.newClientPhone}
                                                    onChange={(e) => setFormData({ ...formData, newClientPhone: e.target.value })}
                                                    placeholder="05xxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">الميزانية (ر.س)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        required
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">الحالة</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
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
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">تاريخ النهاية</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">ملاحظات / وصف</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="تفاصيل إضافية عن المشروع..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-4 bg-muted/30 p-3 rounded-md border border-dashed border-primary/20">
                                <p className="text-sm text-muted-foreground text-center">
                                    اختر أنواع المهام التي سيتم إنشاؤها تلقائياً لهذا المشروع. يمكنك تعديلها لاحقاً.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                                {STANDARD_TASKS.map((task) => (
                                    <div
                                        key={task}
                                        className={cn(
                                            "flex items-center space-x-3 space-x-reverse p-3 rounded-md border cursor-pointer transition-all hover:bg-accent",
                                            formData.selectedTasks.includes(task) ? "border-primary bg-primary/5" : "border-input"
                                        )}
                                        onClick={() => handleTaskToggle(task)}
                                    >
                                        <Checkbox
                                            checked={formData.selectedTasks.includes(task)}
                                            onCheckedChange={() => handleTaskToggle(task)}
                                            id={`task-${task}`}
                                        />
                                        <Label
                                            htmlFor={`task-${task}`}
                                            className="cursor-pointer flex-1 font-normal"
                                        >
                                            {task}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-6 border-t pt-4">
                    {step === 1 ? (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                            <Button onClick={() => setStep(2)} className="gap-2">
                                التالي
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                                <ArrowRight className="w-4 h-4" />
                                السابق
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 min-w-[120px]">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        حفظ المشروع
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
