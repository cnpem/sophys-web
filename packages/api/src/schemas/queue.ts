import { z } from "zod";

const getResponseSchema = z
  .object({
    success: z.boolean(),
    msg: z.string(),
    items: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()),
        kwargs: z.record(z.any()),
        item_type: z.string(),
        user: z.string(),
        user_group: z.string(),
        item_uid: z.string().uuid(),
        result: z
          .object({
            exit_status: z.string().optional(),
            run_uids: z.array(z.string()),
            scan_ids: z.array(z.string()),
            time_start: z.number(),
            time_stop: z.number(),
            msg: z.string().optional(),
            traceback: z.string().optional(),
          })
          .optional()
          .nullable(),
      }),
    ),
    running_item: z
      .object({
        name: z.string().optional(),
        args: z.array(z.any()).optional(),
        kwargs: z.object({}).passthrough().optional(),
        item_type: z.string().optional(),
        user: z.string().optional(),
        user_group: z.string().optional(),
        item_uid: z.string().optional(),
        properties: z.object({}).passthrough().optional(),
        result: z
          .object({
            exit_status: z.string().optional(),
            run_uids: z.array(z.string()).optional(),
            scan_ids: z.array(z.string()).optional(),
            time_start: z.number().optional(),
            time_stop: z.number().optional(),
            msg: z.string().optional(),
            traceback: z.string().optional(),
          })
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
    plan_queue_uid: z.string().uuid(),
  })
  .transform((data) => {
    const {
      success,
      msg,
      items: unprocessedItems,
      running_item,
      plan_queue_uid,
      ...unchanged
    } = data;
    const runningItem = running_item
      ? {
          name: running_item.name,
          args: running_item.args,
          kwargs: running_item.kwargs,
          itemType: running_item.item_type,
          user: running_item.user,
          userGroup: running_item.user_group,
          itemUid: running_item.item_uid,
          properties: running_item.properties,
          result: running_item.result
            ? {
                exitStatus: running_item.result.exit_status,
                runUids: running_item.result.run_uids,
                scanIds: running_item.result.scan_ids,
                timeStart: running_item.result.time_start,
                timeStop: running_item.result.time_stop,
                msg: running_item.result.msg,
                traceback: running_item.result.traceback,
              }
            : null,
        }
      : null;
    const items = unprocessedItems.map((item) => ({
      name: item.name,
      args: item.args,
      kwargs: item.kwargs,
      itemType: item.item_type,
      user: item.user,
      userGroup: item.user_group,
      itemUid: item.item_uid,
      result: item.result
        ? {
            exitStatus: item.result.exit_status,
            runUids: item.result.run_uids,
            scanIds: item.result.scan_ids,
            timeStart: item.result.time_start,
            timeStop: item.result.time_stop,
            msg: item.result.msg,
            traceback: item.result.traceback,
          }
        : null,
    }));
    return {
      success,
      msg,
      items,
      runningItem,
      planQueueUid: plan_queue_uid,
      ...unchanged,
    };
  });

export default { getResponseSchema };
