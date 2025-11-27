'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, User, Users, Shield } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isNewUserOpen, setIsNewUserOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        password: '',
        currentPassword: '',
        avatar: ''
    });

    // New User State
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee'
    });

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'team') {
            fetchUsers();
        }
    }, [activeTab]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // In real app, get ID from session. For now, we need to know WHO we are.
            // Since we don't have a global auth context in this simple demo, we'll just alert.
            // Or we can fetch the first admin user to simulate "me".

            // Simulation:
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            const me = usersData[0]; // Assume first user is me

            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: me._id,
                    ...profile
                }),
            });

            if (res.ok) {
                alert('تم تحديث الملف الشخصي بنجاح');
                setProfile({ name: '', email: '', password: '', currentPassword: '', avatar: '' });
                // Reload to show new avatar
                window.location.reload();
            } else {
                alert('فشل التحديث');
            }
        } catch (error) {
            console.error('Error updating profile', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (res.ok) {
                setIsNewUserOpen(false);
                fetchUsers();
                setNewUser({ name: '', email: '', password: '', role: 'employee' });
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error('Error creating user', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-primary">الإعدادات</h2>

            <div className="flex space-x-4 rtl:space-x-reverse border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-primary font-bold text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        الملف الشخصي
                    </div>
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'team' ? 'border-b-2 border-primary font-bold text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('team')}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        إدارة الفريق
                    </div>
                </button>
            </div>

            {activeTab === 'profile' && (
                <Card>
                    <CardHeader>
                        <CardTitle>تعديل الملف الشخصي</CardTitle>
                        <CardDescription>قم بتحديث معلوماتك الشخصية وكلمة المرور.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="name">الاسم</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="اتركه فارغاً للإبقاء على الحالي"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    placeholder="اتركه فارغاً للإبقاء على الحالي"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatar">رابط الصورة الرمزية (Avatar URL)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="avatar"
                                        value={profile.avatar}
                                        onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setProfile({ ...profile, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}` })}
                                    >
                                        توليد عشوائي
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={profile.password}
                                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التغييرات'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'team' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">أعضاء الفريق</h3>
                        <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    إضافة موظف
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>إضافة موظف جديد</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="u-name">الاسم</Label>
                                        <Input
                                            id="u-name"
                                            required
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="u-email">البريد الإلكتروني</Label>
                                        <Input
                                            id="u-email"
                                            type="email"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="u-pass">كلمة المرور</Label>
                                        <Input
                                            id="u-pass"
                                            type="password"
                                            required
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="u-role">الصلاحية</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">مدير نظام</SelectItem>
                                                <SelectItem value="engineer">مهندس</SelectItem>
                                                <SelectItem value="accountant">محاسب</SelectItem>
                                                <SelectItem value="hr">موارد بشرية</SelectItem>
                                                <SelectItem value="employee">موظف</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsNewUserOpen(false)}>إلغاء</Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
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
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                    <TableHead className="text-right">الصلاحية</TableHead>
                                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingUsers ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            لا يوجد مستخدمين
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' && <Shield className="w-3 h-3 ml-1 inline" />}
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
