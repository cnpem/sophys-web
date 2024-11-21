import { z } from "zod";

const getResponseSchema = z
  .object({
    success: z.boolean(),
    msg: z.string(),
    items: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()).optional().nullable(),
        kwargs: z.record(z.any()).optional().nullable(),
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
    plan_history_uid: z.string().uuid(),
  })
  .transform((data) => {
    const {
      success,
      msg,
      items: unprocessedItems,
      plan_history_uid,
      ...unchanged
    } = data;

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
      planHistoryUid: plan_history_uid,
      ...unchanged,
    };
  });

export default { getResponseSchema };
