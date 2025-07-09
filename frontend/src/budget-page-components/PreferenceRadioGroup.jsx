import { RadioGroup, RadioGroupItem } from "../lib/ui/radio-group";

const PreferenceRadioGroup = ({ name, options, value, onChange, label }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      {label}
    </label>
    <RadioGroup
      value={value}
      onValueChange={(newValue) =>
        onChange({ target: { name, value: newValue } })
      }
      className="flex flex-wrap gap-3"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center justify-center px-4 py-2 rounded-full border-2 cursor-pointer ${
            value === option.value
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
          }`}
        >
          <RadioGroupItem value={option.value} className="sr-only" />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  </div>
);

export default PreferenceRadioGroup;
