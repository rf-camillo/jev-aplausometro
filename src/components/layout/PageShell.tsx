import type { ReactNode } from "react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";

import { LINKS } from "./site";

interface PageShellProps {
  tagline: string;
  /** What sits right under the tagline, as part of the header: the post, on the home page. */
  lead?: ReactNode;
  children: ReactNode;
}

export function PageShell({ tagline, lead, children }: PageShellProps) {
  return (
    <>
      <div className="controls">
        <ThemeSwitch />
      </div>
      <div className="app">
        <header className="app-header">
          <p className="eyebrow">Uma plateia para o seu post</p>
          <h1>Aplausômetro</h1>
          <p className="app-tagline">{tagline}</p>
          {lead}
        </header>
        {children}
        <footer className="app-footer">
          <span>
            Feito por{" "}
            <a href={LINKS.author} target="_blank" rel="noopener noreferrer">
              Rafael Camillo
            </a>{" "}
            com o{" "}
            <a href={LINKS.jev} target="_blank" rel="noopener noreferrer">
              Jev
            </a>
            , da TypeSafe.
          </span>
          <a
            className="footer-code"
            href={LINKS.repository}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
            Código no GitHub
          </a>
        </footer>
      </div>
    </>
  );
}
