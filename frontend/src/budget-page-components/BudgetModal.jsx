import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/dialog";
import BudgetForm from "./BudgetForm";

const BudgetModal = ({ open, setOpen, onSubmit }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Your Budget</DialogTitle>
        </DialogHeader>
        <BudgetForm closeModal={() => setOpen(false)} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default BudgetModal;
