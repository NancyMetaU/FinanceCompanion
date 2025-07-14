const ProgressBar = ({ percentage, color = "bg-blue-500" }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
    <div
      className={`${color} h-2 rounded-full transition-all duration-500 ease-out`}
      style={{ width: `${Math.min(percentage, 100)}%` }}
    />
  </div>
);

export default ProgressBar;
