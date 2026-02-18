// @/components/atoms/input/textArea.tsx

interface TextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  errorMessage?: string;
  isError?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  errorMessage,
  isError = false,
}) => {
  return (
    <div className="self-stretch flex-col justify-start items-start gap-0.5 flex overflow-hidden">
      <div className="self-stretch text-stone-800 text-base font-medium">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`self-stretch h-36 p-3 bg-neutral-50 rounded border flex-col justify-start items-end gap-2 flex overflow-hidden text-gray-400 text-base font-normal font-['Inter'] leading-normal resize-none outline-none transition-all duration-200 ${isError ? 'border-red-500' : 'border-slate-300'}`}
      />
      {isError && errorMessage && (
        <span className="text-red-500 text-xs mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default TextArea;
