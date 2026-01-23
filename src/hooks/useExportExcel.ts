import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

export function useExportExcel() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = <T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ) => {
    try {
      setIsExporting(true);

      const {
        fileName = `export-${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName = 'Sheet1',
      } = options;

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate and download file
      XLSX.writeFile(workbook, fileName);

      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất file!');
    } finally {
      setIsExporting(false);
    }
  };

  const exportMultipleSheets = (
    sheets: Array<{ data: any[]; sheetName: string }>,
    fileName?: string
  ) => {
    try {
      setIsExporting(true);

      const file =
        fileName || `export-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add each sheet
      sheets.forEach(({ data, sheetName }) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generate and download file
      XLSX.writeFile(workbook, file);

      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất file!');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    exportMultipleSheets,
    isExporting,
  };
}
