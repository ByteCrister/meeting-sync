
const LoadingSpinner = ({ border }: { border?: string }) => {
  return (
    <div className="flex justify-center items-center">
      <div className={`w-6 h-6 border-2 border-t-transparent ${border && border.length > 0 ? `${border}` : 'border-blue-900'} border-solid rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
