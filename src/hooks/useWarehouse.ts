import { useState } from 'react';
import { warehouseApi } from '../apis/warehouseApi';
import { Stock, Allocation, Receipt, AllocationStatus, AllocationItem } from '../types';
import { toast } from 'sonner';

export const useWarehouse = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stocks
  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.getStocks();
      if (response.success) {
        setStocks(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin tồn kho');
      toast.error('Không thể tải thông tin tồn kho');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch allocations
  const fetchAllocations = async (params?: {
    page?: number;
    limit?: number;
    teamId?: string;
    status?: AllocationStatus;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.getAllocations(params);
      if (response.success) {
        setAllocations(response.data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phân bổ');
      toast.error('Không thể tải danh sách phân bổ');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch receipts
  const fetchReceipts = async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.getReceipts(params);
      if (response.success) {
        setReceipts(response.data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách biên lai nhập kho');
      toast.error('Không thể tải danh sách biên lai nhập kho');
    } finally {
      setIsLoading(false);
    }
  };

  // Create allocation
  const createAllocation = async (data: {
    items: AllocationItem[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.createAllocation(data);
      if (response.success) {
        toast.success('Tạo phân bổ thành công');
        await fetchAllocations();
        await fetchStocks(); // Refresh stocks after allocation
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tạo phân bổ';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update allocation status
  const updateAllocationStatus = async (id: string, status: AllocationStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.updateAllocationStatus(id, status);
      if (response.success) {
        toast.success('Cập nhật trạng thái phân bổ thành công');
        await fetchAllocations();
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể cập nhật trạng thái';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create receipt
  const createReceipt = async (donationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.createReceipt({ donationId });
      if (response.success) {
        toast.success('Tạo biên lai nhập kho thành công');
        await fetchReceipts();
        await fetchStocks(); // Refresh stocks after receipt
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tạo biên lai nhập kho';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get allocation by ID
  const getAllocation = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.getAllocation(id);
      if (response.success) {
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tải thông tin phân bổ';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get receipt by ID
  const getReceipt = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.getReceipt(id);
      if (response.success) {
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tải thông tin biên lai';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stocks,
    allocations,
    receipts,
    isLoading,
    error,
    fetchStocks,
    fetchAllocations,
    fetchReceipts,
    createAllocation,
    updateAllocationStatus,
    createReceipt,
    getAllocation,
    getReceipt,
  };
};
