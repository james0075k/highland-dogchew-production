import { useState, useCallback, useRef, useEffect } from 'react';
import { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
  finalWidth?: number;
  finalHeight?: number;
}

interface UseImageCropperProps {
  onCropComplete?: (file: File, cropData: CropData) => void;
  onCancel?: () => void;
  aspectRatio?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  initialImage?: string;
}

export const useImageCropper = ({
  onCropComplete,
  onCancel,
  aspectRatio = 0,
  quality = 0.9,
  format = 'image/jpeg',
  initialImage = ''
}: UseImageCropperProps = {}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Configuration
  const cropperConfig = {
    aspectRatio,
    quality,
    format
  };

  // Update imageSrc when initialImage changes, with CORS handling
  useEffect(() => {
    if (initialImage) {
      if (initialImage.startsWith('http') && !initialImage.startsWith(window.location.origin)) {
        setIsLoading(true);
        fetch(initialImage)
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch image');
            return response.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            setImageSrc(blobUrl);
            setError('');
          })
          .catch(error => {
            console.error('Failed to fetch external image:', error);
            setError('Failed to load external image. Please upload a new image instead.');
            setImageSrc('');
          })
          .finally(() => setIsLoading(false));
      } else {
        setImageSrc(initialImage);
        setError('');
      }
    }
  }, [initialImage]);

  // Open cropper
  const openCropper = useCallback((imageSrc?: string, config?: Partial<typeof cropperConfig>) => {
    if (imageSrc) {
      setImageSrc(imageSrc);
    }
    if (config) {
      // Update config if needed
    }
    setIsOpen(true);
    setError('');
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  // Close cropper
  const closeCropper = useCallback(() => {
    setIsOpen(false);
    setImageSrc('');
    setError('');
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(undefined);
    onCancel?.();
  }, [onCancel]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setError('');
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file.');
      }
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    hiddenInputRef.current?.click();
  }, []);

  // Handle image load
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(crop);
    }
  }, [aspectRatio]);

  // Generate cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area first.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Failed to create canvas context.');
        return;
      }

      // Check if image is fully loaded
      if (!imgRef.current.complete || imgRef.current.naturalWidth === 0) {
        throw new Error('Image not fully loaded');
      }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

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
        throw new Error('Failed to process image. This may be due to CORS restrictions for external images.');
      }

      return new Promise<{ file: File; cropData: CropData }>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'cropped-image.jpg', { type: format });
              const cropData: CropData = {
                x: completedCrop.x,
                y: completedCrop.y,
                width: completedCrop.width,
                height: completedCrop.height,
                aspectRatio,
                finalWidth: completedCrop.width * scaleX,
                finalHeight: completedCrop.height * scaleY,
              };
              resolve({ file, cropData });
            } else {
              reject(new Error('Failed to generate cropped image blob'));
            }
          },
          format,
          quality,
        );
      });
    } catch (error) {
      console.error('Generate cropped image error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate cropped image');
      throw error;
    }
  }, [completedCrop, aspectRatio, format, quality]);

  // Handle crop complete
  const handleCropComplete = useCallback(async () => {
    try {
      const result = await generateCroppedImage();
      onCropComplete?.(result.file, result.cropData);
      closeCropper();
    } catch (error) {
      // Error already set in generateCroppedImage
    }
  }, [generateCroppedImage, onCropComplete, closeCropper]);

  // Reset all
  const resetAll = useCallback(() => {
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError('');
  }, []);

  return {
    // State
    isOpen,
    imageSrc,
    crop,
    completedCrop,
    scale,
    error,
    isLoading,
    
    // Refs
    imgRef,
    hiddenInputRef,
    
    // Configuration
    cropperConfig,
    
    // Actions
    openCropper,
    closeCropper,
    handleFileUpload,
    triggerFileInput,
    onImageLoad,
    handleCropComplete,
    resetAll,
    
    // Setters
    setCrop,
    setCompletedCrop,
    setScale,
    setError,
  };
}; 