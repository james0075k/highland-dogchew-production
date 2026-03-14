"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";

interface LogoType {
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface LogoProps {
  width?: number;
  height?: number;
  index?: number;
  imgClassName?: string;
}

const LogoComponent = ({ width = 75, height = 30, index = 0, imgClassName }: LogoProps) => {
  const [logo, setLogo] = useState<LogoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/api/logo");
        const data = await response.json();

        setLogo(data[index]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load logo");
        setLoading(false);
      }
    };

    fetchLogo();
  }, [index]);

  const memoizedLogo = useMemo(() => logo, [logo]);

  if (loading) {
    return (
      <div className="flex justify-start">
        <div className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] bg-[#E8DFD1] animate-pulse rounded-full" />
      </div>
    );
  }

  const baseImgClass = imgClassName ?? "h-[48px] w-[48px] md:h-[56px] md:w-[56px]";

  if (error || !memoizedLogo) {
    return (
      <div className="flex justify-start">
        <Image
          src="/images/logo11.png"
          alt="Highland Yakchew"
          width={width}
          height={height}
          className={`${baseImgClass} object-contain drop-shadow-[0_1px_2px_rgba(46,31,20,0.3)]`}
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <Image
        src={memoizedLogo.url}
        alt={memoizedLogo.alt}
        width={width}
        height={height}
        className={`${baseImgClass} object-contain drop-shadow-[0_1px_2px_rgba(46,31,20,0.3)]`}
        priority
      />
    </div>
  );
};

export default React.memo(LogoComponent);
