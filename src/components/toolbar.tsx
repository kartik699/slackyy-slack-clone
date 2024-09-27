import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";

import { Hint } from "./hint";
import { Button } from "./ui/button";
import { EmojiPopover } from "./emoji-popover";

interface ToolbarProps {
    isAuthor: boolean;
    isPending: boolean;
    handleEdit: () => void;
    handleThread: () => void;
    handleDelete: () => void;
    handleReaction: (value: string) => void;
    hideThreadButton?: boolean;
}

export const Toolbar = ({
    handleDelete,
    handleEdit,
    handleReaction,
    handleThread,
    isAuthor,
    isPending,
    hideThreadButton,
}: ToolbarProps) => {
    return (
        <div className="absolute top-0 right-5">
            <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
                <EmojiPopover
                    onEmojiSelect={(emoji) => handleReaction(emoji.native)}
                    hint="Add reaction"
                >
                    <Button
                        variant={"ghost"}
                        size={"iconSm"}
                        disabled={isPending}
                    >
                        <Smile className="size-4" />
                    </Button>
                </EmojiPopover>
                {!hideThreadButton && (
                    <Hint label="Reply in thread">
                        <Button
                            variant={"ghost"}
                            size={"iconSm"}
                            disabled={isPending}
                        >
                            <MessageSquareTextIcon className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <>
                        <Hint label="Edit Message">
                            <Button
                                variant={"ghost"}
                                size={"iconSm"}
                                disabled={isPending}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        </Hint>
                        <Hint label="Delete Message">
                            <Button
                                variant={"ghost"}
                                size={"iconSm"}
                                disabled={isPending}
                            >
                                <Trash className="size-4" />
                            </Button>
                        </Hint>
                    </>
                )}
            </div>
        </div>
    );
};
