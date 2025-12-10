"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import { Form } from "@sophys-web/ui/form";
import type { Sample } from "./sample-item";
import { getSamples, setSamples } from "../../actions/samples";

export function DeleteSampleForm({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const form = useForm();

  const emptySample: Sample = {
    id: sample.id,
    relativePosition: sample.relativePosition,
    sampleTag: undefined,
    bufferTag: undefined,
    sampleType: undefined,
    row: sample.row,
    col: sample.col,
    tray: sample.tray,
  };

  async function onSubmit() {
    const samples = await getSamples();
    await setSamples(
      samples.map((s) => (s.id === sample.id ? emptySample : s)),
    );
    toast.success("Sample deleted!");
    onSubmitCallback?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-fit space-y-8">
        <p>Deleting sample information:</p>
        <div className="text-sm">
          <p>{`type: ${sample.sampleType}`}</p>
          <p>{`name: ${sample.sampleTag}`}</p>
          {sample.bufferTag && <p>{`buffer: ${sample.bufferTag}`}</p>}
        </div>
        <Button type="submit" className="w-full">
          Delete
        </Button>
      </form>
    </Form>
  );
}
