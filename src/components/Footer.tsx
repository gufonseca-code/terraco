import { TerracoLogo } from "./TerracoLogo";

export function Footer() {
  return (
    <>
      <footer
        className="footer closing footer--visit"
        id="contato"
        aria-labelledby="close-h"
      >
        <div className="wrap">
          <div className="closing__cta close--type">
            <div className="section-head">
              <h2 id="close-h">Conheça os decorados esta semana</h2>
              <p className="t-lead">
                Visitas individuais na Vila Madalena, Pinheiros e Perdizes.
              </p>
            </div>
            <a className="btn btn--primary btn--xl" href="#agendar">
              Agendar visita
              <svg
                className="m-arrow"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </a>
          </div>

          <div className="closing__links">
            <div className="grid">
              <div className="span-6 stack-4">
                <address className="footer__address">
                  Vila Madalena, Pinheiros e Perdizes
                  <br />
                  São Paulo, SP
                </address>
                <p>
                  <a
                    className="link"
                    href="https://www.openstreetmap.org/search?query=Vila+Madalena+Sao+Paulo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver a região
                  </a>
                </p>
                <TerracoLogo href="#top" />
              </div>

              <div className="span-6 start-7 stack-4">
                <h3>Horários de atendimento</h3>
                <dl
                  className="hours"
                  data-assumed=""
                  data-tz="America/Sao_Paulo"
                >
                  <dt data-days="mon-fri">Seg a Sex</dt>
                  <dd data-assumed="">09:00 às 19:00</dd>
                  <dt data-days="sat">Sábado</dt>
                  <dd data-assumed="">10:00 às 17:00</dd>
                  <dt data-days="sun">Domingo</dt>
                  <dd data-assumed="">Com agendamento</dd>
                </dl>
              </div>
            </div>

            <div className="footer__legal">
              <span>© 2026 Terraço</span>
              <div className="socials" />
              <details className="credits">
                <summary>Fotografias via Wikimedia Commons</summary>
                <p>
                  Imagens ilustrativas de referência via Wikimedia Commons:
                  kallerna (CC BY-SA 4.0), Bmbrozig (CC BY-SA 4.0), Ninara (CC BY
                  2.0), Wgreaves (CC BY-SA 4.0), Aatu Dorochenko (CC BY-SA 4.0),
                  Charlie Brewer (CC BY-SA 2.0), William Murphy (CC BY-SA 2.0),
                  Wpcpey (CC BY-SA 4.0) e Adityamadhav83 (CC BY 4.0).
                </p>
              </details>
            </div>
          </div>
        </div>
      </footer>

      <nav className="actionbar" aria-label="Ação rápida">
        <a className="btn btn--primary" href="#agendar">
          Agendar visita
        </a>
      </nav>
    </>
  );
}
