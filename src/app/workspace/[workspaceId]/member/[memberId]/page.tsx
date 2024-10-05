"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader } from "lucide-react";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";

import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";

import { Conversation } from "./conversation";

const MemberIdPage = () => {
    const workspaceId = useWorkspaceId();
    const memberId = useMemberId();

    const [conversationId, setConvrsationId] =
        useState<Id<"conversations"> | null>(null);

    const { mutate, isPending } = useCreateOrGetConversation();

    useEffect(() => {
        mutate(
            { workspaceId, memberId },
            {
                onSuccess(data) {
                    setConvrsationId(data);
                },
                onError() {
                    toast.error("Failed to create or get conversation");
                },
            },
        );
    }, [memberId, workspaceId, mutate]);

    if (isPending) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!conversationId) {
        return (
            <div className="h-full flex flex-col gap-y-2 items-center justify-center">
                <AlertTriangle className="size-6 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                    Conversation not found!
                </span>
            </div>
        );
    }

    return <Conversation id={conversationId} />;
};

export default MemberIdPage;
