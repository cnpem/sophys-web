"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Skeleton } from "@sophys-web/ui/skeleton";

const FormSchema = z.object({
  username: z.string().min(2, { message: "Username is required" }),
  password: z.string().min(2, { message: "Password is required" }),
  proposal: z.string().length(8, {
    message: "Proposal must be 8 characters long",
  }),
});

interface ActionState {
  success: boolean;
  message: string;
}

export function SignInForm({
  signInAction,
}: {
  signInAction: (data: FormData) => Promise<ActionState>;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
      proposal: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    toast.info("Signing in...");
    const callbackUrl = params.get("callbackUrl") ?? "/";
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("proposal", data.proposal);
    const res = await signInAction(formData);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    router.push(callbackUrl);
  };

  return (
    <Form {...form}>
      <form
        className="my-auto flex flex-col space-y-6 rounded-sm border p-24 shadow-lg"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="user.name"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal</FormLabel>
              <FormControl>
                <Input
                  placeholder="20250001"
                  {...field}
                  maxLength={8}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} type="submit">
          Sign in
        </Button>
      </form>
    </Form>
  );
}

export function SignInFormSkeleton() {
  return (
    <div className="flex flex-col space-y-6 rounded-sm border p-24 shadow-lg">
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}
