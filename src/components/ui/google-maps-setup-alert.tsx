import { Alert, AlertDescription, AlertTitle } from './alert';
import { ExternalLink, Map } from 'lucide-react';

interface GoogleMapsSetupAlertProps {
  className?: string;
}

export function GoogleMapsSetupAlert({ className }: GoogleMapsSetupAlertProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isConfigured = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

  if (isConfigured) {
    return null;
  }

  return (
    <Alert className={className}>
      <Map className="h-4 w-4" />
      <AlertTitle>Cấu hình Google Maps API</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">
          Để sử dụng tính năng chọn địa điểm trên bản đồ với autocomplete, bạn cần cấu hình Google Maps API Key.
        </p>
        
        <div className="text-sm space-y-1">
          <p className="font-medium">Cách lấy API Key (3-5 phút):</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              Truy cập{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Cloud Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Tạo project mới hoặc chọn project có sẵn</li>
            <li>
              Enable 3 APIs: 
              <span className="font-mono text-xs ml-1">
                Maps JavaScript API, Places API, Geocoding API
              </span>
            </li>
            <li>Tạo API Key tại phần Credentials</li>
            <li>Copy API Key và paste vào file <code className="bg-muted px-1 py-0.5 rounded">.env</code></li>
            <li>Restart dev server: <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
          </ol>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Xem hướng dẫn chi tiết trong file{' '}
          <code className="bg-muted px-1 py-0.5 rounded">SETUP-GOOGLE-MAPS.md</code>
        </p>

        <p className="text-xs text-muted-foreground">
          ℹ️ Nếu chưa cấu hình, bạn vẫn có thể nhập địa chỉ bằng text thông thường.
        </p>
      </AlertDescription>
    </Alert>
  );
}
