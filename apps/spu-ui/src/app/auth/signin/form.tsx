"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "@sophys-web/ui/sonner";
import { signIn } from "../../actions/auth";

const FormSchema = z.object({
  username: z.string().min(2, { message: "Username is required" }),
  password: z.string().min(2, { message: "Password is required" }),
  proposal: z.string().length(8, {
    message: "Proposal must be 8 characters long",
  }),
});

export function SignInForm() {
  const params = useSearchParams();
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
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
    const res = await signIn({
      username: data.username,
      password: data.password,
      proposal: data.proposal,
    });

    if (res?.error) {
      const error = res.error;
      toast.error(error);
      form.reset();
    }

    if (!res?.error) {
      toast.success("Signed in successfully");
      router.push(callbackUrl);
    }
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
