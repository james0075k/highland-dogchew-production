"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUploadCloud, FiCrop, FiX, FiCheck } from 'react-icons/fi';

interface ImageCropperProps {
  onCropComplete: (croppedImage: File, cropData: CropData) => void;
  onCancel: () => void;
  initialImage?: string;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
  finalWidth?: number;
  finalHeight?: number;
}

interface AspectRatioOption {
  label: string;
  value: number;
  description: string;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { label: 'Free', value: 0, description: 'No aspect ratio constraint' },
  { label: 'Square', value: 1, description: '1:1 ratio' },
  { label: 'Landscape', value: 16/9, description: '16:9 ratio' },
  { label: 'Portrait', value: 9/16, description: '9:16 ratio' },
  { label: 'Wide', value: 21/9, description: '21:9 ratio' },
  { label: 'Hero', value: 3/1, description: '3:1 ratio for hero sections' },
  { label: 'Banner', value: 4/1, description: '4:1 ratio for banners' },
];

const ImageCropper: React.FC<ImageCropperProps> = ({
  onCropComplete,
  onCancel,
  initialImage,
  aspectRatio = 0,
  maxWidth = 1920,
  maxHeight = 1080,
  minWidth = 100,
  minHeight = 100,
  quality = 0.9,
  format = 'image/jpeg'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(initialImage || '');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number>(aspectRatio);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update imageSrc when initialImage changes, with CORS handling
  useEffect(() => {
    if (initialImage) {
      if (initialImage.startsWith('http') && !initialImage.startsWith(window.location.origin)) {
        setIsLoading(true);
        setError('');
        
        // First try to load the image directly to check if it's accessible
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        testImg.onload = () => {
          // Image loaded successfully, now try to fetch as blob
          fetch(initialImage, {
            mode: 'cors',
            credentials: 'omit'
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.blob();
            })
            .then(blob => {
              if (!blob.type.startsWith('image/')) {
                throw new Error('The URL does not point to a valid image');
              }
              const blobUrl = URL.createObjectURL(blob);
              setImageSrc(blobUrl);
              setError('');
            })
            .catch(error => {
              console.error('Failed to fetch external image as blob:', error);
              // Fallback: try to load the image directly
              setImageSrc(initialImage);
              setError('Note: External image loaded but may have CORS restrictions during cropping. If cropping fails, please upload the image directly.');
            })
            .finally(() => setIsLoading(false));
        };
        
        testImg.onerror = () => {
          console.error('Failed to load external image');
          setError('Failed to load external image. Please upload the image directly from your device.');
          setIsLoading(false);
        };
        
        testImg.src = initialImage;
      } else {
        setImageSrc(initialImage);
        setError('');
      }
    }
  }, [initialImage]);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    if (selectedAspectRatio > 0) {
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          selectedAspectRatio,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(crop);
    } else {
      // Free crop - start with a centered crop
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
            height: 80,
          },
          1,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(crop);
    }
  }, [selectedAspectRatio]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size should be less than 10MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (ratio: number) => {
    setSelectedAspectRatio(ratio);
    if (imgRef.current && ratio > 0) {
      const { width, height } = imgRef.current;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          ratio,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(crop);
    }
  };

  // Generate cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      setError('Please select a crop area');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Check if image is fully loaded
      if (!imgRef.current.complete || imgRef.current.naturalWidth === 0) {
        throw new Error('Image not fully loaded');
      }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.imageSmoothingQuality = 'high';

             // Add error handling for CORS issues
       try {
         ctx.drawImage(
           imgRef.current,
           completedCrop.x * scaleX,
           completedCrop.y * scaleY,
           completedCrop.width * scaleX,
           completedCrop.height * scaleY,
           0,
           0,
           completedCrop.width * scaleX,
           completedCrop.height * scaleY,
         );
       } catch (drawError) {
         console.error('Draw image error:', drawError);
         // Try alternative approach for CORS-restricted images
         if (imgRef.current.src.startsWith('http') && !imgRef.current.src.startsWith(window.location.origin)) {
           throw new Error('CORS restrictions prevent cropping this external image. Please upload the image directly from your device.');
         } else {
           throw new Error('Failed to process image. Please try uploading a different image.');
         }
       }

      // Convert to blob with error handling
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'cropped-image.jpg', { type: format });
            const cropData: CropData = {
              x: completedCrop.x,
              y: completedCrop.y,
              width: completedCrop.width,
              height: completedCrop.height,
              aspectRatio: selectedAspectRatio > 0 ? selectedAspectRatio : undefined,
              finalWidth: completedCrop.width * scaleX,
              finalHeight: completedCrop.height * scaleY,
            };
            onCropComplete(file, cropData);
          } else {
            setError('Failed to generate cropped image blob');
          }
        },
        format,
        quality
      );
    } catch (error) {
      console.error('Crop error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to generate cropped image');
      }
    } finally {
      setIsLoading(false);
    }
  }, [completedCrop, selectedAspectRatio, onCropComplete, format, quality]);

  // Reset crop
  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (selectedAspectRatio > 0) {
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            selectedAspectRatio,
            width,
            height,
          ),
          width,
          height,
        );
        setCrop(crop);
      }
    }
  };

  // Reset all settings
  const resetAll = () => {
    setScale(1);
    resetCrop();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Image Cropper</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-3 sm:px-4 py-2 bg-red-50 border-l-4 border-red-400 flex-shrink-0">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="px-3 sm:px-4 py-2 bg-blue-50 border-l-4 border-blue-400 flex-shrink-0">
            <p className="text-blue-700 text-sm">Loading image...</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Image Area - Takes up most of the space */}
          <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden">
                         {!imageSrc ? (
               <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg p-4">
                 <FiUploadCloud className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                 <p className="text-gray-600 mb-2 text-center text-sm sm:text-base">Upload an image to crop</p>
                 <p className="text-gray-500 mb-4 text-center text-xs">For best results, upload images directly from your device</p>
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors touch-manipulation text-sm sm:text-base"
                 >
                   Choose Image
                 </button>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   onChange={handleFileSelect}
                   className="hidden"
                 />
               </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Image Container with defined dimensions */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={selectedAspectRatio > 0 ? selectedAspectRatio : undefined}
                      minWidth={minWidth}
                      minHeight={minHeight}
                      className="max-w-full max-h-full"
                    >
                                             <img
                         ref={imgRef}
                         alt="Crop me"
                         src={imageSrc}
                         crossOrigin="anonymous"
                         style={{
                           transform: `scale(${scale})`,
                           maxWidth: '100%',
                           maxHeight: '100%',
                           objectFit: 'contain',
                         }}
                         onLoad={onImageLoad}
                         onError={(e) => {
                           console.error('Image load error:', e);
                           setError('Failed to load image. This may be due to CORS restrictions. Please try uploading the image directly instead.');
                         }}
                         className="max-w-full max-h-full"
                       />
                    </ReactCrop>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel - Responsive width */}
          <div className="w-full lg:w-80 border-t lg:border-l lg:border-t-0 border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <div className="space-y-4 sm:space-y-6">
                {/* File Upload */}
                {!imageSrc && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <FiUploadCloud className="w-4 h-4" />
                      Choose Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {aspectRatioOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAspectRatioChange(option.value)}
                        className={`p-3 sm:p-2 text-xs rounded-lg border transition-colors touch-manipulation ${
                          selectedAspectRatio === option.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        title={option.description}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale: {scale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full h-8 sm:h-6"
                  />
                </div>

                                 {/* Actions */}
                 {imageSrc && (
                   <div className="space-y-3">
                     <button
                       onClick={resetCrop}
                       className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                     >
                       <FiCrop className="w-4 h-4" />
                       Reset Crop
                     </button>
                     <button
                       onClick={resetAll}
                       className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                     >
                       Reset All
                     </button>
                     <button
                       onClick={generateCroppedImage}
                       disabled={isLoading || !completedCrop}
                       className="w-full px-4 py-3 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                     >
                       {isLoading ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           Processing...
                         </>
                       ) : (
                         <>
                           <FiCheck className="w-4 h-4" />
                           Apply Crop
                         </>
                       )}
                     </button>
                     
                     {/* Upload new image button for CORS issues */}
                     {imageSrc.startsWith('http') && !imageSrc.startsWith(window.location.origin) && (
                       <button
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full px-4 py-3 sm:py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                       >
                         <FiUploadCloud className="w-4 h-4" />
                         Upload Local Image (Recommended)
                       </button>
                     )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 