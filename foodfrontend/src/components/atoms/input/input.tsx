import { useState } from "react";

const Input = ({
  label,
  required = false,
  placeholder,
  type = "text",
  prefix,
  options,
  value = "",
  onChange,
  validate,
  errorMessage,
  phone = false,
  isError = false,
  className =''
}) => {
  const [isTouched, setIsTouched] = useState(false);

  const isValid = !validate || validate(value);

  const handleChange = (val) => {
    if (onChange && typeof onChange === "function") {
      onChange(val);
    }
    if (!isTouched) setIsTouched(true);
  };

  const renderInputField = () => {
    if (type === "select" && options) {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full bg-transparent outline-none text-base text-gray-700 ${className}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="flex items-center gap-4 w-full">
        {prefix && (
          <span className="text-gray-400 text-base font-medium">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-base text-gray-700"
        />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-base font-semibold tracking-widest ">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        className={`px-1 pt-2 pb-1 bg-white rounded-none border-b transition-all duration-200 focus-within:border-[#0e334f] focus-within:ring-0 hover:border-[#0e334f] ${isError ? 'border-red-500' : 'border-slate-200'}`}
      >
        {renderInputField()}
      </div>

      {(isError && errorMessage) || (isTouched && !isValid) ? (
        <span className="text-red-500 text-xs mt-1">{errorMessage}</span>
      ) : null}
    </div>
  );
};

export default Input;
