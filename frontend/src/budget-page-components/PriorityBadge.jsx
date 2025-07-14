const PriorityBadge = ({ priority, type }) => {
  const isHighPriority = priority === "high";
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isHighPriority
          ? "bg-blue-100 text-blue-800 border border-blue-200"
          : "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {isHighPriority && <span className="text-blue-600">⭐</span>}
      <span className="capitalize">
        {priority} Priority {type}
      </span>
    </div>
  );
};

export default PriorityBadge;
