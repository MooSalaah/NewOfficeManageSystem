"use client"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export function Notifications() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">الإشعارات</h4>
                        <p className="text-sm text-muted-foreground">
                            لديك 3 إشعارات جديدة.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
                            <span className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                            <div className="grid gap-1">
                                <p className="text-sm font-medium">مشروع جديد</p>
                                <p className="text-xs text-muted-foreground">تم إضافة مشروع "فيلا الملقا"</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
                            <span className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                            <div className="grid gap-1">
                                <p className="text-sm font-medium">مهمة مكتملة</p>
                                <p className="text-xs text-muted-foreground">أنهى محمد المخططات الأولية</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
                            <span className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                            <div className="grid gap-1">
                                <p className="text-sm font-medium">دفعة مالية</p>
                                <p className="text-xs text-muted-foreground">تم استلام دفعة مقدمة 50,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
