import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCategories } from "../../hooks/useCategory";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Chọn danh mục...",
  disabled = false,
}: CategorySelectProps) {
  const { data: categoriesData, isLoading } = useCategories({ limit: 100 });
  const categories = categoriesData?.items || [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Đang tải..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 ? (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-categories" disabled>
            Chưa có danh mục
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
