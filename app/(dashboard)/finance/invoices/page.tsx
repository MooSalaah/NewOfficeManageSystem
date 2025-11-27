'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Simplified New Invoice State
    const [newInvoice, setNewInvoice] = useState({
        clientName: '', // In real app, select ID
        amount: '',
        description: '',
        dueDate: ''
    });

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Quick client create/find logic again or just use a dummy ID if we had a proper select
            // For this demo, we need a valid client ID.
            // Let's fetch the first client or create one.
            const clientRes = await fetch('/api/clients/quick', {
                method: 'POST',
                body: JSON.stringify({ name: newInvoice.clientName, phone: '0000000000' }),
            });
            const clientData = await clientRes.json();

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client: clientData._id,
                    totalAmount: Number(newInvoice.amount),
                    items: [{
                        description: newInvoice.description,
                        quantity: 1,
                        unitPrice: Number(newInvoice.amount),
                        total: Number(newInvoice.amount)
                    }],
                    dueDate: newInvoice.dueDate,
                    status: 'draft'
                }),
            });

            if (res.ok) {
                setIsNewInvoiceOpen(false);
                fetchInvoices();
                setNewInvoice({ clientName: '', amount: '', description: '', dueDate: '' });
            }
        } catch (error) {
            console.error('Error creating invoice', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = (invoice: any) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: 'Cairo', sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 40px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
              .total { margin-top: 20px; text-align: left; font-size: 1.2em; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>فاتورة ضريبية</h1>
              <p>رقم الفاتورة: ${invoice.invoiceNumber}</p>
            </div>
            <div class="details">
              <p><strong>العميل:</strong> ${invoice.client?.name}</p>
              <p><strong>التاريخ:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>الوصف</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice}</td>
                    <td>${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              الإجمالي: ${invoice.totalAmount} ر.س
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">الفواتير</h2>
                <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            إنشاء فاتورة
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="client">العميل</Label>
                                <Input
                                    id="client"
                                    required
                                    value={newInvoice.clientName}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                                    placeholder="اسم العميل"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">المبلغ الإجمالي</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    required
                                    value={newInvoice.amount}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">الوصف</Label>
                                <Input
                                    id="description"
                                    required
                                    value={newInvoice.description}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    required
                                    value={newInvoice.dueDate}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsNewInvoiceOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إنشاء'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">رقم الفاتورة</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    لا توجد فواتير
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice._id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.client?.name}</TableCell>
                                    <TableCell>{format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: arSA })}</TableCell>
                                    <TableCell>{invoice.totalAmount.toLocaleString()} ر.س</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                                            {invoice.status === 'paid' ? 'مدفوعة' : 'مسودة'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handlePrint(invoice)}>
                                            <Printer className="w-4 h-4" />
                                        </Button>
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
