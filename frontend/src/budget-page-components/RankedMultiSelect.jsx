const RankedMultiSelect = ({
  name,
  options,
  value,
  onChange,
  label,
  max = 3,
}) => {
  const toggleSelection = (optionValue) => {
    const isSelected = value.includes(optionValue);

    const updated = isSelected
      ? value.filter((v) => v !== optionValue)
      : value.length < max
      ? [...value, optionValue]
      : value;

    onChange({ target: { name, value: updated } });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div
        className="flex flex-wrap gap-3"
        role="group"
        aria-labelledby={`${name}-label`}
      >
        {options.map(({ value: optionValue, label: optionLabel }) => {
          const selectedIndex = value.indexOf(optionValue);
          const isSelected = selectedIndex !== -1;
          const isMaxReached = value.length >= max && !isSelected;

          return (
            <button
              type="button"
              key={optionValue}
              onClick={() => toggleSelection(optionValue)}
              disabled={isMaxReached}
              aria-pressed={isSelected}
              className={`relative px-4 py-2 rounded-full text-sm font-medium border
                ${
                  isSelected
                    ? "bg-blue-100 border-blue-500 text-blue-700 "
                    : isMaxReached
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 cursor-pointer"
                }`}
            >
              {optionLabel}
              {isSelected && (
                <span
                  className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`Priority ${selectedIndex + 1}`}
                >
                  {selectedIndex + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RankedMultiSelect;
