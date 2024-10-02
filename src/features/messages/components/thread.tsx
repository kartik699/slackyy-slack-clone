import { useState } from "react";
import { AlertTriangle, Loader, XIcon } from "lucide-react";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";

import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useCurrentMember } from "@/features/members/api/use-current-member";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../convex/_generated/dataModel";

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

    const { data: message, isLoading: messageLoading } = useGetMessage({
        id: messageId,
    });

    const workspaceId = useWorkspaceId();
    const { data: currentMember } = useCurrentMember({ workspaceId });

    if (messageLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Message Not Found!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="h-[49px] flex justify-between items-center px-4 border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
                    <XIcon className="size-5 stroke-[1.5]" />
                </Button>
            </div>
            <Message
                hideThreadButton
                memberId={message.memberId}
                authorImage={message.user.image}
                authorName={message.user.name}
                body={message.body}
                createdAt={message._creationTime}
                id={message._id}
                isAuthor={currentMember?._id === message.memberId}
                isEditing={message._id === editingId}
                image={message.image}
                reactions={message.reactions}
                setEditingId={setEditingId}
                updatedAt={message.updatedAt}
            />
        </div>
    );
};
