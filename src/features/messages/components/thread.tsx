import Quill from "quill";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";

import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const TIME_THRESHOLD = 5;

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image?: Id<"_storage">;
};

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);

    if (isToday(date)) {
        return "Today";
    } else if (isYesterday(date)) {
        return "Yesterday";
    } else return format(date, "EEEE, MMMM d");
};

export const Thread = ({ messageId, onClose }: ThreadProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

    const editorRef = useRef<Quill | null>(null);

    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();

    const { mutate: createMessage } = useCreateMessage();
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();

    const { data: message, isLoading: messageLoading } = useGetMessage({
        id: messageId,
    });
    const { results, status, loadMore } = useGetMessages({
        channelId,
        parentMessageId: messageId,
    });

    const { data: currentMember } = useCurrentMember({ workspaceId });

    const canLoadMore = status === "CanLoadMore";
    const isLoadingMore = status === "LoadingMore";

    const groupedMessages = results?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].unshift(message);

            return groups;
        },
        {} as Record<string, typeof results>,
    );

    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            setIsPending(true);
            editorRef.current?.enable(false);

            const values: CreateMessageValues = {
                body,
                workspaceId,
                channelId,
                image: undefined,
                parentMessageId: messageId,
            };

            if (image) {
                const uploadUrl = await generateUploadUrl(
                    {},
                    { throwError: true },
                );

                if (!uploadUrl) {
                    throw new Error("URL not found!");
                }

                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": image.type,
                    },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image!");
                }

                const { storageId } = await result.json();

                values.image = storageId;
            }

            await createMessage(values, { throwError: true });

            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);

            editorRef.current?.enable(true);
        }
    };

    if (messageLoading || status === "LoadingFirstPage") {
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
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                {Object.entries(groupedMessages || {}).map(
                    ([dateKey, messages]) => (
                        <div key={dateKey}>
                            <div className="text-center my-2 relative">
                                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                    {formatDateLabel(dateKey)}
                                </span>
                            </div>
                            {messages.map((message, index) => {
                                const prevMessage = messages[index - 1];

                                const isCompact =
                                    prevMessage &&
                                    prevMessage.user._id === message.user._id &&
                                    differenceInMinutes(
                                        new Date(message._creationTime),
                                        new Date(prevMessage._creationTime),
                                    ) < TIME_THRESHOLD;

                                return (
                                    <Message
                                        key={message._id}
                                        id={message._id}
                                        memberId={message.memberId}
                                        authorImage={message.user.image}
                                        authorName={message.user.name}
                                        isAuthor={
                                            message.memberId ===
                                            currentMember?._id
                                        }
                                        reactions={message.reactions}
                                        body={message.body}
                                        image={message.image}
                                        updatedAt={message.updatedAt}
                                        createdAt={message._creationTime}
                                        isEditing={editingId === message._id}
                                        setEditingId={setEditingId}
                                        isCompact={isCompact}
                                        hideThreadButton
                                        threadCount={message.threadCount}
                                        threadImage={message.threadImage}
                                        threadTimestamp={
                                            message.threadTimestamp
                                        }
                                    />
                                );
                            })}
                        </div>
                    ),
                )}
                <div
                    className="h-1"
                    ref={(el) => {
                        if (el) {
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting && canLoadMore) {
                                        loadMore();
                                    }
                                },
                                { threshold: 1.0 },
                            );
                            observer.observe(el);
                            return () => observer.disconnect();
                        }
                    }}
                />
                {isLoadingMore && (
                    <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                            <Loader className="size-4 animate-spin" />
                        </span>
                    </div>
                )}
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
            <div className="px-4">
                <Editor
                    key={editorKey}
                    onSubmit={handleSubmit}
                    innerRef={editorRef}
                    disabled={isPending}
                    placeholder="Reply..."
                />
            </div>
        </div>
    );
};
