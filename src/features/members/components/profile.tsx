import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ChevronDownIcon,
    Loader,
    MailIcon,
    XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { useGetMember } from "../api/use-get-member";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useCurrentMember } from "../api/use-current-member";

import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../convex/_generated/dataModel";

interface ProfileProps {
    memberId: Id<"members">;
    onClose: () => void;
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const [LeaveDialog, confirmLeave] = useConfirm(
        "Leave Workspace",
        "Are you sure you want to leave this workspace?",
    );
    const [RemoveDialog, confirmRemove] = useConfirm(
        "Remove Member",
        "Are you sure you want to remove this member?",
    );
    const [UpdateDialog, confirmUpdate] = useConfirm(
        "Change Role",
        "Are you sure you want to change this member's role?",
    );

    const { data: member, isLoading: memberLoading } = useGetMember({
        id: memberId,
    });
    const { data: currentMember, isLoading: currentMemberLoading } =
        useCurrentMember({ workspaceId });

    const { mutate: updateMember, isPending: isUpdatingMember } =
        useUpdateMember();
    const { mutate: removeMember, isPending: isRemovingMember } =
        useRemoveMember();

    const onRemove = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        removeMember(
            { id: memberId },
            {
                onSuccess: () => {
                    toast.success("Member Removed");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to remove member");
                },
            },
        );
    };

    const onLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;

        removeMember(
            { id: memberId },
            {
                onSuccess: () => {
                    router.replace("/");
                    toast.success("You left the workspace");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to leave workspace");
                },
            },
        );
    };

    const onUpdate = async (role: "admin" | "member") => {
        const ok = await confirmUpdate();

        if (!ok) return;

        updateMember(
            { id: memberId, role },
            {
                onSuccess: () => {
                    toast.success("Role changed");
                },
                onError: () => {
                    toast.error("Failed to change role");
                },
            },
        );
    };

    if (memberLoading || currentMemberLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
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

    if (!member || !currentMember) {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Profile Not Found!
                    </p>
                </div>
            </div>
        );
    }

    const avatarFallback = member.user.name?.[0] ?? "M";

    return (
        <>
            <LeaveDialog />
            <RemoveDialog />
            <UpdateDialog />
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col p-4 items-center justify-center">
                    <Avatar className="max-w-[256px] max-h-[256px] size-full">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback className="aspect-square text-6xl">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col p-4">
                    <p className="text-xl font-bold">{member.user.name}</p>
                    {currentMember.role === "admin" &&
                    currentMember._id !== member._id ? (
                        <div className="flex items-center gap-2 mt-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className="w-full capitalize"
                                    >
                                        {member.role}{" "}
                                        <ChevronDownIcon className="size-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full">
                                    <DropdownMenuRadioGroup
                                        value={member.role}
                                        onValueChange={(role) =>
                                            onUpdate(role as "admin" | "member")
                                        }
                                    >
                                        <DropdownMenuRadioItem value="admin">
                                            Admin
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="member">
                                            Member
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                onClick={onRemove}
                                variant={"outline"}
                                className="w-full"
                            >
                                Remove
                            </Button>
                        </div>
                    ) : currentMember._id === member._id &&
                      currentMember.role !== "admin" ? (
                        <div className="mt-4">
                            <Button
                                onClick={onLeave}
                                variant={"outline"}
                                className="w-full"
                            >
                                Leave
                            </Button>
                        </div>
                    ) : null}
                </div>
                <Separator />
                <div className="flex flex-col p-4">
                    <p className="text-sm font-bold mb-4">
                        Contact Information
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                            <MailIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-semibold text-muted-foreground">
                                Email Address
                            </p>
                            <Link
                                href={`mailto:${member.user.email}`}
                                className="text-sm hover:underline text-[#1264a3]"
                            >
                                {member.user.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
