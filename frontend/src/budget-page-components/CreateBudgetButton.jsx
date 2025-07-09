import { useState } from 'react';
import BudgetModal from './BudgetModal';

const CreateBudgetButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-md font-medium text-royal border border-royal px-4 py-1.5 rounded-md hover:bg-royal hover:text-white transition cursor-pointer"
      >
        Create Budget Plan
      </button>
      <BudgetModal open={open} setOpen={setOpen} />
    </>
  );
};

export default CreateBudgetButton;
