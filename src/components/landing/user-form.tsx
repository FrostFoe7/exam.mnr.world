"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "নাম কমপক্ষে ২টি অক্ষরের হতে হবে।",
  }),
  roll: z.string().min(1, {
    message: "রোল নম্বর আবশ্যক।",
  }),
  pass: z.string().min(4, {
    message: "পাসওয়ার্ড কমপক্ষে ৪টি অক্ষরের হতে হবে।",
  }),
});

type UserFormValues = z.infer<typeof formSchema>;

type UserFormProps = {
  defaultValues: Partial<User> | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

export function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      roll: defaultValues?.roll || "",
      pass: defaultValues?.pass || "",
    },
  });

  const { formState, handleSubmit } = form;

  const handleFormSubmit = async (values: UserFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>নাম</FormLabel>
              <FormControl>
                <Input
                  placeholder="ব্যবহারকারীর নাম"
                  {...field}
                  disabled={formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roll"
          render={({ field }) => (
            <FormItem>
              <FormLabel>রোল নম্বর</FormLabel>
              <FormControl>
                <Input
                  placeholder="রোল নম্বর"
                  {...field}
                  disabled={formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>পাসওয়ার্ড</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="নতুন পাসওয়ার্ড"
                  {...field}
                  disabled={formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              সংরক্ষণ করা হচ্ছে...
            </>
          ) : (
            "সংরক্ষণ করুন"
          )}
        </Button>
      </form>
    </Form>
  );
}
