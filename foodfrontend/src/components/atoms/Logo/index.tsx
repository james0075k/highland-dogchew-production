"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { usePawLoaded } from "@/components/atoms/PawBackground";

let _logoCache: any[] | null = null;
let _logoPromise: Promise<any[]> | null = null;

function fetchLogos(): Promise<any[]> {
  if (_logoCache) return Promise.resolve(_logoCache);
  if (_logoPromise) return _logoPromise;

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";
  _logoPromise = fetch(`${API}/logo`)
    .then((r) => {
      if (!r.ok) throw new Error(`Logo fetch failed: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const logos = Array.isArray(data) ? data : data?.data ?? [];
      _logoCache = logos;
      return logos;
    })
    .catch(() => {
      _logoPromise = null;
      return [];
    });

  return _logoPromise;
}

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
  onLoaded?: () => void;
}

const LogoComponent = ({ width = 75, height = 30, index = 0, imgClassName, onLoaded }: LogoProps) => {
  const [logo, setLogo] = useState<LogoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pawLoaded = usePawLoaded();
  const notifiedRef = useRef(false);

  const notifyLoaded = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onLoaded?.();
    pawLoaded?.();
  };

  useEffect(() => {
    let cancelled = false;
    fetchLogos().then((logos) => {
      if (cancelled) return;
      if (logos[index]) {
        setLogo(logos[index]);
      } else {
        setError("Logo not found");
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [index]);

  const memoizedLogo = useMemo(() => logo, [logo]);

  if (loading) {
    return null;
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
          onLoad={notifyLoaded}
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
        onLoad={notifyLoaded}
      />
    </div>
  );
};

export default React.memo(LogoComponent);
