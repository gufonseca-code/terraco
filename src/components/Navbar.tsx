"use client";

import { useEffect, useState } from "react";
import { TerracoLogo } from "./TerracoLogo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("nav-locked", isOpen);
    return () => {
      document.body.classList.remove("nav-locked");
    };
  }, [isOpen]);

  function handleLinkClick() {
    setIsOpen(false);
  }

  return (
    <header className={`nav nav--centre${isOpen ? " is-open" : ""}`}>
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">
          Ir para o conteúdo
        </a>

        <TerracoLogo href="#top" />

        <nav className="nav__links" aria-label="Navegação principal">
          <div className="nav__item">
            <a
              className="nav__link"
              href="#lancamentos"
              onClick={handleLinkClick}
            >
              Lançamentos
            </a>
          </div>
          <div className="nav__item">
            <a
              className="nav__link"
              href="#como-funciona"
              onClick={handleLinkClick}
            >
              Processo
            </a>
          </div>
          <div className="nav__item">
            <a
              className="nav__link"
              href="#diferenciais"
              onClick={handleLinkClick}
            >
              Diferenciais
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="#contato" onClick={handleLinkClick}>
              Contato
            </a>
          </div>
        </nav>

        <div className="nav__actions">
          <a
            className="btn btn--primary"
            href="#agendar"
            onClick={handleLinkClick}
          >
            Agendar visita
          </a>
        </div>

        <button
          className="nav__toggle"
          type="button"
          aria-expanded={isOpen}
          aria-label="Menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            {isOpen ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2 5h14M2 13h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
