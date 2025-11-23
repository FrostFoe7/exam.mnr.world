"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/landing/user-form";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Batch } from "@/lib/types";

interface UsersClientProps {
  initialUsers: User[];
  initialBatches: Batch[];
}

export function UsersClient({
  initialUsers,
  initialBatches,
}: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [batches] = useState<Batch[]>(initialBatches);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEnroll, setUserToEnroll] = useState<User | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toast } = useToast();

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const openEnrollDialog = (user: User) => {
    setUserToEnroll(user);
    setIsEnrollDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("uid", userToDelete.uid);

    if (error) {
      toast({
        variant: "destructive",
        title: "ব্যর্থ হয়েছে",
        description: `ব্যবহারকারী ${userToDelete.name} কে মুছে ফেলা সম্ভব হয়নি।`,
      });
    } else {
      setUsers(users.filter((user) => user.uid !== userToDelete.uid));
      toast({
        title: "সফল হয়েছে",
        description: `ব্যবহারকারী ${userToDelete.name} কে সফলভাবে মুছে ফেলা হয়েছে।`,
      });
    }
    setIsAlertOpen(false);
    setUserToDelete(null);
  };

  const onFormSubmit = async (values: {
    name: string;
    roll: string;
    pass: string;
  }) => {
    if (selectedUser) {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...values,
        })
        .eq("uid", selectedUser.uid)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "আপডেট ব্যর্থ হয়েছে",
          description: "ব্যবহারকারীর তথ্য আপডেট করা সম্ভব হয়নি।",
        });
      } else {
        setUsers(users.map((u) => (u.uid === data.uid ? data : u)));
        toast({
          title: "সফল হয়েছে",
          description: "ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে।",
        });
        setIsUserDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("users")
        .insert([{ ...values, enrolled_batches: [] }])
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "যোগ করা ব্যর্থ হয়েছে",
          description: "নতুন ব্যবহারকারী যোগ করা সম্ভব হয়নি।",
        });
      } else {
        setUsers([...users, data]);
        toast({
          title: "সফল হয়েছে",
          description: "নতুন ব্যবহারকারী সফলভাবে যোগ করা হয়েছে।",
        });
        setIsUserDialogOpen(false);
      }
    }
  };

  const handleEnrollStudent = async () => {
    if (!userToEnroll || !selectedBatch) return;

    setIsEnrolling(true);

    const userToUpdate = users.find((u) => u.uid === userToEnroll.uid);
    if (!userToUpdate) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।",
      });
      setIsEnrolling(false);
      return;
    }

    if (
      userToUpdate.enrolled_batches &&
      userToUpdate.enrolled_batches.includes(selectedBatch)
    ) {
      toast({
        variant: "destructive",
        title: "ভর্তি করানো ব্যর্থ হয়েছে",
        description: "এই ব্যবহারকারী ইতিমধ্যে এই ব্যাচে ভর্তি আছেন।",
      });
    } else {
      const updatedBatches = userToUpdate.enrolled_batches
        ? [...userToUpdate.enrolled_batches, selectedBatch]
        : [selectedBatch];

      const { data, error } = await supabase
        .from("users")
        .update({ enrolled_batches: updatedBatches })
        .eq("uid", userToEnroll.uid)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "ভর্তি করানো ব্যর্থ হয়েছে",
          description: "এই ব্যবহারকারীকে ব্যাচে ভর্তি করানো সম্ভব হয়নি।",
        });
      } else {
        setUsers(users.map((u) => (u.uid === data.uid ? data : u)));
        toast({
          title: "সফল হয়েছে",
          description: `${userToEnroll.name} কে ব্যাচে সফলভাবে ভর্তি করানো হয়েছে।`,
        });
        setIsEnrollDialogOpen(false);
        setUserToEnroll(null);
        setSelectedBatch(null);
      }
    }
    setIsEnrolling(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ব্যবহারকারীগণ</CardTitle>
              <CardDescription>
                আপনার প্ল্যাটফর্মে নিবন্ধিত সকল ব্যবহারকারীর তালিকা।
              </CardDescription>
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1" onClick={handleAddUser}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    নতুন ব্যবহারকারী
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedUser
                      ? "ব্যবহারকারীর তথ্য সম্পাদনা করুন"
                      : "নতুন ব্যবহারকারী যোগ করুন"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedUser
                      ? "ব্যবহারকারীর বিবরণ পরিবর্তন করুন।"
                      : "নতুন ব্যবহারকারীর জন্য প্রয়োজনীয় তথ্য দিন।"}
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  defaultValues={selectedUser}
                  onSubmit={onFormSubmit}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>রোল নম্বর</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.roll}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>কার্যক্রম</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>সম্পাদনা</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEnrollDialog(user)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>ব্যাচে ভর্তি</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteConfirm(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>মুছে ফেলুন</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ব্যবহারকারীকে মুছে ফেললে তা আর ফেরানো যাবে না। আপনি কি সত্যিই
              এই ব্যবহারকারীকে মুছে ফেলতে চান?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              নিশ্চিত করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ব্যাচে ভর্তি করুন</DialogTitle>
            <DialogDescription>
              {userToEnroll?.name} কে একটি ব্যাচে ভর্তি করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select onValueChange={setSelectedBatch} disabled={isEnrolling}>
              <SelectTrigger>
                <SelectValue placeholder="একটি ব্যাচ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleEnrollStudent} disabled={isEnrolling}>
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ভর্তি করা হচ্ছে...
              </>
            ) : (
              "ভর্তি নিশ্চিত করুন"
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
