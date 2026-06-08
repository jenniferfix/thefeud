import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export const ErrorDialog = ({
	title = "Error",
	message,
	show,
	setShow,
}: {
	title?: string | null;
	message: string | null;
	show: boolean;
	setShow: (show: boolean) => void;
}) => {
	return (
		<Dialog open={show} onOpenChange={(open) => setShow(open)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title ?? ""}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose>Thanks!</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
