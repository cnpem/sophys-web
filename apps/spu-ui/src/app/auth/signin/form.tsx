"use client";

import { useSearchParams } from "next/navigation";
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
  email: z
    .string()
    .min(2, { message: "Email is required" })
    .email({ message: "Input must be a valid e-mail" }),
  password: z.string().min(2, { message: "Password is required" }),
});

export function SignInForm() {
  const params = useSearchParams();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    toast.info("Signing in...");
    const res = await signIn(
      {
        email: data.email,
        password: data.password,
      },
      params.get("callbackUrl") || "/",
    );

    if (res?.error) {
      const error = res.error;
      toast.error(error);
      form.reset();
    }

    if (!res?.error) {
      toast.success("Signed in successfully");
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="user@example.com"
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
        <Button disabled={form.formState.isSubmitting} type="submit">
          Sign in
        </Button>
      </form>
    </Form>
  );
}
