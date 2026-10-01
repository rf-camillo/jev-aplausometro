"use client";

import { Check, Info, LoaderCircle } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { FINE_PRINT_ID } from "@/components/layout/FinePrint";
import { MAX_POST_LENGTH } from "@/lib/audience/live";
import type { Status } from "@/lib/audience/status";

import { ErrorNotice } from "./ErrorNotice";
import { EXAMPLES } from "./examples";

interface ComposerProps {
  post: string;
  status: Status | null;
  error: string | null;
  onChange: (post: string) => void;
  /** Evaluates right away; bound to Ctrl or ⌘ + Enter for posts too short to go on their own. */
  onSubmit: () => void;
}

/**
 * The post, in a quiet field that starts as one line and grows with the text. The tagline above
 * says what to write, so the field needs no placeholder, and there is no button: the audience
 * reacts on its own when the writer pauses.
 */
export function Composer({ post, status, error, onChange, onSubmit }: ComposerProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = "auto";
    const borders = field.offsetHeight - field.clientHeight;
    const needed = field.scrollHeight + borders;
    const limit = Number.parseFloat(getComputedStyle(field).maxHeight);
    field.style.height = `${String(needed)}px`;
    field.style.overflowY = needed > limit ? "auto" : "hidden";
  }, [post]);

  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  return (
    <section className="composer" aria-label="Escreva o seu post">
      <textarea
        ref={fieldRef}
        className="composer-input"
        value={post}
        maxLength={MAX_POST_LENGTH}
        rows={1}
        aria-label="Seu post"
        aria-describedby={FINE_PRINT_ID}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) onSubmit();
        }}
      />
      <div className="composer-meta">
        <span className="composer-examples">
          <span className="wide-only">Experimente:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              className="button button-chip"
              onClick={() => onChange(example.post)}
            >
              {example.label}
            </button>
          ))}
        </span>
        <span className="composer-progress">
          {error ? (
            <ErrorNotice message={error} onRetry={onSubmit} />
          ) : (
            <span className="composer-status" role="status">
              {status?.kind === "busy" && (
                <LoaderCircle className="inline-icon is-spinning" aria-hidden="true" />
              )}
              {status?.kind === "done" && <Check className="inline-icon" aria-hidden="true" />}
              {status?.kind === "hint" && (
                <Info className="inline-icon is-warm" aria-hidden="true" />
              )}
              {status?.text}
            </span>
          )}
          <span className="composer-count">
            {post.length}/{MAX_POST_LENGTH}
          </span>
        </span>
      </div>
    </section>
  );
}
