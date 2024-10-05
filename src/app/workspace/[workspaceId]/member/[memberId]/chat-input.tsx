import Quill from "quill";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
    placeholder: string;
    conversationId: Id<"conversations">;
}

type CreateMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image?: Id<"_storage">;
};

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();

    const { mutate: createMessage } = useCreateMessage();
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();

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
                conversationId,
                image: undefined,
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

    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    );
};
