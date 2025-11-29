'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Save, Trash2 } from 'lucide-react';

interface InvoiceDialogProps {
    onInvoiceSaved: () => void;
}

export function InvoiceDialog({ onInvoiceSaved }: InvoiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        projectId: '',
        clientId: '', // Will be auto-set based on project
        amount: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'pending',
        items: [{ description: '', quantity: 1, price: 0 }]
    });

    useEffect(() => {
        if (open) {
            fetch('/api/projects').then(res => res.json()).then(data => setProjects(data));
        }
    }, [open]);

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p._id === projectId);
        setFormData(prev => ({
            ...prev,
            projectId,
            clientId: project?.client?._id || '',
            // Auto-fill amount from project budget if empty (optional logic)
        }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));

        // Auto-calculate total amount
        const total = newItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
        setFormData(prev => ({ ...prev, amount: total.toString() }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/finance/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: formData.projectId,
                    client: formData.clientId,
                    amount: Number(formData.amount),
                    issueDate: formData.issueDate,
                    dueDate: formData.dueDate,
                    status: formData.status,
                    items: formData.items
                }),
            });

            if (res.ok) {
                setOpen(false);
                onInvoiceSaved();
                setFormData({
                    projectId: '',
                    clientId: '',
                    amount: '',
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: '',
                    status: 'pending',
                    items: [{ description: '', quantity: 1, price: 0 }]
                });
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4" />
                    فاتورة جديدة
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                    <div className="sr-only">
                        <p>نموذج لإنشاء فاتورة جديدة وتحديد المشروع والبنود.</p>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="project">المشروع</Label>
                        <Select value={formData.projectId} onValueChange={handleProjectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر المشروع" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issueDate">تاريخ الإصدار</Label>
                            <Input
                                id="issueDate"
                                type="date"
                                required
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>بنود الفاتورة</Label>
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-end border p-2 rounded-md bg-muted/20">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">الوصف</Label>
                                    <Input
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        placeholder="وصف البند"
                                    />
                                </div>
                                <div className="w-20 space-y-1">
                                    <Label className="text-xs">الكمية</Label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <Label className="text-xs">السعر</Label>
                                    <Input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة بند
                        </Button>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-lg font-bold">
                            الإجمالي: {Number(formData.amount).toLocaleString()} ر.س
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                حفظ الفاتورة
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
