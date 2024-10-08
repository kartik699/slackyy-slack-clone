import { Loader } from "lucide-react";

import { useMemberId } from "@/hooks/use-member-id";

import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";

import { Id } from "../../../../../../convex/_generated/dataModel";

import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

interface ConversationProps {
    id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
    const memberId = useMemberId();

    const { onOpenProfile } = usePanel();

    const { data: member, isLoading: memberLoading } = useGetMember({
        id: memberId,
    });
    const { results, status, loadMore } = useGetMessages({
        conversationId: id,
    });

    if (memberLoading || status === "LoadingFirstPage") {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <Header
                memberName={member?.user.name}
                memberImage={member?.user.image}
                onClick={() => onOpenProfile(memberId)}
            />
            <MessageList
                data={results}
                canLoadMore={status === "CanLoadMore"}
                loadMore={loadMore}
                isLoadingMore={status === "LoadingMore"}
                variant={"conversation"}
                memberImage={member?.user.image}
                memberName={member?.user.name}
            />
            <ChatInput
                conversationId={id}
                placeholder={`Message ${member?.user.name}`}
            />
        </div>
    );
};
