import Link from "next/link";
import { useState } from "react";
import { Info, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

export const Toolbar = () => {
    const workspaceId = useWorkspaceId();

    const { isLoading, data } = useGetWorkspace({ id: workspaceId });
    const { data: channels, isLoading: channelsLoading } = useGetChannels({
        workspaceId,
    });
    const { data: members, isLoading: membersLoading } = useGetMembers({
        workspaceId,
    });

    const [open, setOpen] = useState(false);

    return (
        <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
            <div className="flex-1" />
            <div className="min-w-[280px] max-w-[642px] grow-[2] shrink">
                <Button
                    onClick={() => setOpen(true)}
                    size={"sm"}
                    className="bg-accent/25 hover:bg-accent/15 w-full justify-start h-7 px-2"
                >
                    <Search className="size-4 text-white mr-2" />
                    {!isLoading && (
                        <span className="text-white text-xs">
                            Search {data?.name}
                        </span>
                    )}
                </Button>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Channels">
                            {channels?.map((channel) => (
                                <CommandItem
                                    key={channel._id}
                                    onSelect={() => setOpen(false)}
                                    className="cursor-pointer"
                                    asChild
                                >
                                    <Link
                                        href={`/workspace/${workspaceId}/channel/${channel._id}`}
                                    >
                                        # {channel.name}
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Members">
                            {members?.map((member) => (
                                <CommandItem
                                    key={member._id}
                                    onSelect={() => setOpen(false)}
                                    className="cursor-pointer"
                                    asChild
                                >
                                    <Link
                                        href={`/workspace/${workspaceId}/member/${member._id}`}
                                    >
                                        {member.user.name}
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>
            <div className="ml-auto flex-1 flex items-center justify-end">
                <Button variant={"transparent"} size={"iconSm"}>
                    <Info className="size-5 text-white" />
                </Button>
            </div>
        </nav>
    );
};
