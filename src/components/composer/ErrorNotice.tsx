import { CircleAlert, RotateCw } from "lucide-react";

interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <span className="error-notice">
      <span role="alert">
        <CircleAlert className="inline-icon is-error" aria-hidden="true" />
        {message}
      </span>
      <button type="button" className="error-retry" onClick={onRetry}>
        <RotateCw aria-hidden="true" />
        Tentar de novo
      </button>
    </span>
  );
}
