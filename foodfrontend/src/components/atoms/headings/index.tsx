'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import Button from '../button';
import Link from 'next/link';

type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
type TextSize = 'medium' | 'small' | 'large' | 'custom';
type TextHeaderType = 'main' | 'default';

interface TextHeaderProps {
  text?: string;
  align?: TextAlign;
  className?: string;
  width?: string | number;
  size?: TextSize;
  buttonText?: string;
  textcolor?: string;
  type?: TextHeaderType;
  buttonLink?: string;
  specialWordsIndices?: number | number[]; // ADD THIS LINE
}

const TextHeader = ({
  text = '',
  align = 'center',
  className = '',
  width = '100%',
  size = 'medium',
  buttonText,
  textcolor = '',
  type = 'default',
  buttonLink,
  specialWordsIndices = [], // ADD THIS LINE WITH DEFAULT
}: TextHeaderProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    margin: '-10% 0px -10% 0px',
  });

  // SAFE TEXT
  const validText = React.useMemo(() => {
    if (!text || typeof text !== 'string') return '';
    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : '';
  }, [text]);

  // SAFE WORD SPLIT
  const words = React.useMemo(() => {
    if (!validText) return [];
    return validText.split(/\s+/).filter(word => word.length > 0);
  }, [validText]);

  // SAFE SPECIAL WORDS INDICES
  const safeSpecialIndices = React.useMemo(() => {
    if (!specialWordsIndices) return [];
    return Array.isArray(specialWordsIndices) 
      ? specialWordsIndices 
      : [specialWordsIndices];
  }, [specialWordsIndices]);

  // FONT SETTINGS
  const baseFontStyles = {
    medium: {
      fontSize: 'clamp(2rem, 5vw, 3.25rem)',
      lineHeight: 1,
    },
    small: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      lineHeight: 1.15,
    },
    large: {
      fontSize: 'clamp(1.75rem, 3vw, 2rem)',
      lineHeight: 1.25,
    },
  };

  const baseStyle = {
    textAlign: align,
    fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
    color: textcolor || '#2E1F14',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    ...baseFontStyles[size],
  };

  // NUMBER ANIMATION SUPPORT
  const isNumberText = !isNaN(Number(validText)) && validText.length > 0;
  const [displayNumber, setDisplayNumber] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (isInView && isNumberText && validText) {
      const controls = animate(motionValue, Number(validText), {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setDisplayNumber(Math.floor(v)),
      });

      return controls.stop;
    }
  }, [isInView, validText, isNumberText, motionValue]);

  // RENDER TEXT WITH SPECIAL WORDS SUPPORT
  const renderText = () => {
    if (!validText || words.length === 0) return null;

    if (isNumberText) {
      return (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={baseStyle}
        >
          {displayNumber}
        </motion.span>
      );
    }

    return words.map((word, index) => {
      const isSpecial = safeSpecialIndices.includes(index);
      
      return (
        <motion.span
          key={`word-${index}-${word}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            delay: index * 0.07,
            duration: 0.5,
            ease: 'easeOut',
          }}
          className={isSpecial ? 'text-orange-500 font-bold' : ''}
        >
          {word}{' '}
        </motion.span>
      );
    });
  };

  const alignmentClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
    justify: 'items-stretch text-justify',
    start: 'items-start text-left',
    end: 'items-end text-right',
  }[align];

  if (!validText && !buttonText) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`flex flex-col ${alignmentClass} ${
        align === 'center' ? 'mx-auto' : ''
      } ${className} 
      max-w-[100%] sm:max-w-[550px] md:max-w-[650px] lg:max-w-[800px] hyphens-auto text-justify`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    >
      {buttonText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-2"
        >
          {buttonLink ? (
            <Link href={buttonLink}>
              <Button
                text={buttonText}
                variant="secondary"
                textColor="text-primary"
                className="text-sm md:text-base"
                disableHover={true}
              />
            </Link>
          ) : (
            <Button
              text={buttonText}
              variant="secondary"
              textColor="text-primary"
              className="text-sm md:text-base"
              disableHover={true}
            />
          )}
        </motion.div>
      )}

      {validText && words.length > 0 && (
        <motion.h1
          className={`text-header ${type === 'main' ? 'mb-4 md:mb-6' : 'mb-0'}`}
          style={baseStyle}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {renderText()}
        </motion.h1>
      )}
    </div>
  );
};

export default TextHeader;