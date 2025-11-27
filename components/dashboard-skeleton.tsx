import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-20" /></CardTitle>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div>
                            <p className="text-xs text-muted-foreground mt-2"><Skeleton className="h-3 w-24" /></p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <div className="mr-auto">
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
