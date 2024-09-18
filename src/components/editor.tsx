import Image from "next/image";
import { Delta, Op } from "quill/core";
import { MdSend } from "react-icons/md";
import { PiTextAa } from "react-icons/pi";
import Quill, { type QuillOptions } from "quill";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import {
    MutableRefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { cn } from "@/lib/utils";

import { Hint } from "./hint";
import { Button } from "./ui/button";
import { EmojiPopover } from "./emoji-popover";

import "quill/dist/quill.snow.css";

type EditorValue = {
    image: File | null;
    body: string;
};

interface EditorProps {
    onSubmit: ({ image, body }: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
    variant?: "create" | "update";
}

const Editor = ({
    onSubmit,
    defaultValue = [],
    disabled = false,
    innerRef,
    onCancel,
    placeholder = "Write Something...",
    variant = "create",
}: EditorProps) => {
    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const disabledRef = useRef(disabled);
    const imageElementRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div"),
        );

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link"],
                    [{ list: "ordered" }, { list: "bullet" }],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                // TODO: Submit Form
                                return;
                            },
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quill.insertText(
                                    quill.getSelection()?.index || 0,
                                    "\n",
                                );
                            },
                        },
                    },
                },
            },
        };

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        if (innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => setText(quill.getText()));

        return () => {
            quill.off(Quill.events.TEXT_CHANGE);
            if (container) container.innerHTML = "";
            if (quillRef.current) {
                quillRef.current = null;
            }
            if (innerRef) {
                innerRef.current = null;
            }
        };
    }, [innerRef]);

    const toggleToolbar = () => {
        setIsToolbarVisible((curr) => !curr);
        const toolbarElement =
            containerRef.current?.querySelector(".ql-toolbar");

        if (toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    };

    const onEmojiSelect = (emoji: any) => {
        quillRef.current?.insertText(
            quillRef.current.getSelection()?.index || 0,
            emoji.native,
        );
    };

    const isEmpty = text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    return (
        <div className="flex flex-col">
            <input
                type="file"
                accept="image/*"
                ref={imageElementRef}
                onChange={(e) => setImage(e.target.files![0])}
                className="hidden"
            />
            <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
                <div ref={containerRef} className="h-full ql-custom" />
                {!!image && (
                    <div className="p-2">
                        <div className="relative size-[62px] flex items-center justify-center group/image">
                            <Hint label="Remove Image">
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        imageElementRef.current!.value = "";
                                    }}
                                    className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                                >
                                    <XIcon className="size-3.5" />
                                </button>
                            </Hint>
                            <Image
                                src={URL.createObjectURL(image)}
                                alt="uploaded"
                                fill
                                className="rounded-xl overflow-hidden border object-cover"
                            />
                        </div>
                    </div>
                )}
                <div className="flex px-2 pb-2 z-[5]">
                    <Hint
                        label={
                            isToolbarVisible
                                ? "Hide Formatting"
                                : "Show Formatting"
                        }
                    >
                        <Button
                            disabled={disabled}
                            size={"iconSm"}
                            variant={"ghost"}
                            onClick={toggleToolbar}
                        >
                            <PiTextAa className="size-4" />
                        </Button>
                    </Hint>
                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                        <Button
                            disabled={disabled}
                            size={"iconSm"}
                            variant={"ghost"}
                        >
                            <Smile className="size-4" />
                        </Button>
                    </EmojiPopover>
                    {variant === "create" && (
                        <Hint label="Image">
                            <Button
                                disabled={disabled}
                                size={"iconSm"}
                                variant={"ghost"}
                                onClick={() => imageElementRef.current?.click()}
                            >
                                <ImageIcon className="size-4" />
                            </Button>
                        </Hint>
                    )}
                    {variant === "update" && (
                        <div className="ml-auto flex items-center gap-x-2">
                            <Button
                                variant={"outline"}
                                size={"sm"}
                                onClick={() => {}}
                                disabled={disabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={disabled || isEmpty}
                                onClick={() => {}}
                                size={"sm"}
                                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    {variant === "create" && (
                        <Hint label="Send">
                            <Button
                                size={"iconSm"}
                                disabled={disabled || isEmpty}
                                onClick={() => {}}
                                className={cn(
                                    "ml-auto",
                                    isEmpty
                                        ? "bg-white hover:bg-white text-muted-foreground"
                                        : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white",
                                )}
                            >
                                <MdSend className="size-4" />
                            </Button>
                        </Hint>
                    )}
                </div>
            </div>
            {variant === "create" && (
                <div
                    className={cn(
                        "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0",
                        !isEmpty && "opacity-100",
                    )}
                >
                    <p>
                        <strong>Shift + Return</strong> to add a new line
                    </p>
                </div>
            )}
        </div>
    );
};

export default Editor;
