// components/TextDescription.tsx
import React from 'react';

interface TextDescriptionProps {
  text: string;
  className?: string;
}

const TextDescription: React.FC<TextDescriptionProps> = ({ text, className = '' }) => {
  return (
    <p
      className={`font-dm-sans font-normal !hyphens-auto text-justify text-[#1A1E21] opacity-80  ${className}`}
    >
      {text}
    </p>
  );
};

export default TextDescription;

