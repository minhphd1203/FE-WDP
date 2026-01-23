import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UploadOptions {
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  multiple?: boolean;
}

interface UploadResult {
  success: boolean;
  files: File[];
  urls?: string[];
  error?: string;
}

export function useFileUpload(options: UploadOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    acceptedTypes = ['image/*'],
    multiple = false,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      toast.error(
        `File ${file.name} quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`
      );
      return false;
    }

    // Check file type
    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === type;
    });

    if (!isAccepted) {
      toast.error(`File ${file.name} có định dạng không được hỗ trợ`);
      return false;
    }

    return true;
  };

  const uploadFiles = useCallback(
    async (files: FileList | File[]): Promise<UploadResult> => {
      try {
        setIsUploading(true);

        const fileArray = Array.from(files);

        // Validate number of files
        if (!multiple && fileArray.length > 1) {
          toast.error('Chỉ được chọn 1 file');
          return { success: false, files: [], error: 'Multiple files not allowed' };
        }

        // Validate each file
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) {
          return { success: false, files: [], error: 'No valid files' };
        }

        // In a real app, you would upload to a server here
        // For now, we'll just create object URLs
        const urls = validFiles.map((file) => URL.createObjectURL(file));

        setUploadedFiles((prev) => [...prev, ...validFiles]);
        setUploadedUrls((prev) => [...prev, ...urls]);

        toast.success(`Tải lên ${validFiles.length} file thành công!`);

        return {
          success: true,
          files: validFiles,
          urls,
        };
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Có lỗi xảy ra khi tải file!');
        return {
          success: false,
          files: [],
          error: 'Upload failed',
        };
      } finally {
        setIsUploading(false);
      }
    },
    [multiple, maxSize, acceptedTypes]
  );

  const clearFiles = useCallback(() => {
    // Revoke object URLs to free memory
    uploadedUrls.forEach((url) => URL.revokeObjectURL(url));
    setUploadedFiles([]);
    setUploadedUrls([]);
  }, [uploadedUrls]);

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(uploadedUrls[index]);
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [uploadedUrls]
  );

  return {
    uploadFiles,
    clearFiles,
    removeFile,
    isUploading,
    uploadedFiles,
    uploadedUrls,
  };
}
