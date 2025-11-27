'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { InvoiceDialog } from '@/components/finance/invoice-dialog';

export default function FinancePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

                        </CardContent >
                    </Card >
                </TabsContent >
            </Tabs >
        </div >
    );
}
