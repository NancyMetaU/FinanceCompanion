import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import PreferenceRadioGroup from "./PreferenceRadioGroup";
import EmploymentTypeRadioGroup from "./EmploymentTypeRadioGroup";
import ErrorMessage from "../shared-components/ErrorMessage";
import RankedMultiSelect from "./RankedMultiSelect";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SPENDING_FOCUS_OPTIONS = [
  { value: "food", label: "Food" },
  { value: "clothes", label: "Clothes" },
  { value: "home", label: "Home" },
  { value: "leisure", label: "Leisure" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "pets", label: "Pets" },
];

const BudgetForm = ({ closeModal, onSubmit }) => {
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    employmentType: "",
    savingsPriority: "",
    debtPriority: "",
    spendingFocus: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = getAuth().currentUser;
      const idToken = await user.getIdToken();

      const prefsRes = await fetch(`${BACKEND_URL}/api/user/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          monthlyIncome: parseFloat(formData.monthlyIncome),
          employmentType: formData.employmentType,
          savingsPriority: formData.savingsPriority,
          debtPriority: formData.debtPriority,
          spendingFocus: formData.spendingFocus,
        }),
      });

      if (!prefsRes.ok) throw new Error("Failed to update preferences");

      const budgetRes = await fetch(`${BACKEND_URL}/api/budget/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!budgetRes.ok) throw new Error("Failed to generate budget");

      const budgetResponse = await budgetRes.json();

      const flattenedBudget = {
        ...budgetResponse.budgetData,
        priorities: {
          savings: formData.savingsPriority,
          debt: formData.debtPriority,
        },
      };

      onSubmit(flattenedBudget);
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="User Budget Preferences">
      {error && <ErrorMessage message={error} />}
      <div className="mb-6">
        <label
          htmlFor="monthlyIncome"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Monthly Income (pre-tax)
        </label>
        <input
          id="monthlyIncome"
          name="monthlyIncome"
          type="number"
          value={formData.monthlyIncome}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your monthly income ($)"
          required
        />
      </div>

      <EmploymentTypeRadioGroup
        name="employmentType"
        label="Employment Type"
        value={formData.employmentType}
        onChange={handleInputChange}
      />

      <PreferenceRadioGroup
        name="savingsPriority"
        label="Priority on saving?"
        value={formData.savingsPriority}
        onChange={handleInputChange}
        options={PRIORITY_OPTIONS}
      />
      <PreferenceRadioGroup
        name="debtPriority"
        label="Priority on debt?"
        value={formData.debtPriority}
        onChange={handleInputChange}
        options={PRIORITY_OPTIONS}
      />
      <RankedMultiSelect
        name="spendingFocus"
        options={SPENDING_FOCUS_OPTIONS}
        value={formData.spendingFocus}
        onChange={handleInputChange}
        label="Top 3 categories you like to treat yourself in"
      />

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
