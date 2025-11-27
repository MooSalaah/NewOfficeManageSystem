'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">تسجيل الدخول</CardTitle>
                    <CardDescription>
                        نظام إدارة المكاتب الهندسية
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pr-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    dir="ltr" // Email is usually LTR
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الدخول...
                                </>
                            ) : (
                                'دخول'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    © 2025 جميع الحقوق محفوظة
                </CardFooter>
            </Card>
        </div>
    );
}
