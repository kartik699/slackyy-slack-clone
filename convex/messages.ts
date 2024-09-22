import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";

const getMember = (
    ctx: QueryCtx,
    workspaceId: Id<"workspaces">,
    userId: Id<"users">,
) => {
    return ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
            q.eq("workspaceId", workspaceId).eq("userId", userId),
        )
        .unique();
};

export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        parentMessageId: v.optional(v.id("messages")),
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) throw new Error("Unauthorized!");

        const member = await getMember(ctx, args.workspaceId, userId);

        if (!member) throw new Error("Unauthorized!");

        let _conversationId = args.conversationId;

        // only possible if we are replying in a thread in 1:1 conversations
        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("Parent message not found!");
            }

            _conversationId = parentMessage.conversationId;
        }

        const messageId = await ctx.db.insert("messages", {
            body: args.body,
            memberId: member._id,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
            image: args.image,
            parentMessageId: args.parentMessageId,
            conversationId: _conversationId,
            updatedAt: Date.now(),
        });

        return messageId;
    },
});
