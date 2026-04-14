import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import type { Sample } from "./use-sample-store";
import { useSampleStore } from "./use-sample-store";

export function DeleteSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const form = useForm();
  const { deleteSample } = useSampleStore();

  async function onSubmit() {
    console.log("Deleting sample with ID:", sample.id);
    try {
      await deleteSample(sample.id);
      form.reset();
      toast.success("Sample deleted!");
      onSubmitCallback?.();
    } catch (error) {
      console.error("Error deleting sample:", error);
      toast.error("Failed to delete sample. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <Button type="submit" className="w-full" variant="destructive">
          Delete
        </Button>
      </form>
    </Form>
  );
}
