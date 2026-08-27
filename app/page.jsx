"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import {
  TOTAL,
  seg,
  after,
  segStart,
  shuffledOrder,
} from "../lib/timeline";
import {
  works,
  facts,
  heroTop,
  heroBottom,
  heroLead,
  expertiseLead,
  principles,
  approachLead,
  skills,
  workModes,
  clientsLead,
  brands,
  testimonials,
  contactsLead,
  footerCols,
} from "../lib/content";

import { Paren, Wordmark } from "../components/glyphs";

/* Программный скролл — через Lenis, чтобы ехал с той же инерцией */
function smoothTo(y) {
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/* ------------------------------------------------------------------ */
/*  Мелкие детали                                                      */
/* ------------------------------------------------------------------ */

/* Слово с анимацией смены: при изменении key элемент перемонтируется
   и проигрывается появление снизу */
function Swap({ text, className = "h1" }) {
  return (
    <span key={text} className={`swapWord ${className}`}>
      {text}
    </span>
  );
}

/* Смена с чистым проявлением, без сдвига */
function Fade({ text, className = "h1" }) {
  return (
    <span key={text} className={`swapFade ${className}`}>
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Ячейки хиро                                                        */
/* ------------------------------------------------------------------ */

function WorkItem({ w, onHover, onLeave }) {
  return (
    <div
      className="workItem caption"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="title">
        <span className="year">{w.year}</span>
        <span className="name">{w.title}</span>
      </div>
      <div className="desc">{w.description}</div>
    </div>
  );
}

function FactItem({ f }) {
  return (
    <div className="factItem caption">
      <Paren kind="(" />
      <div className="text">
        <div>fact №{f.n}</div>
        <div>{f.text}</div>
      </div>
      <Paren kind=")" />
    </div>
  );
}

const RATIO_SIZE = {
  "2:1": [80, 40],
  "16:9": [80, 45],
  "3:2": [90, 60],
  "4:3": [80, 60],
  "1:1": [70, 70],
  "4:5": [64, 80],
  "3:4": [60, 80],
  "2:3": [53.4, 80],
  "9:16": [45, 80],
};

/* ------------------------------------------------------------------ */
/*  Хиро-слой                                                          */
/* ------------------------------------------------------------------ */

const HeroLayer = memo(function HeroLayer({ goneCount, leadGone, heroDone }) {
  const [hovered, setHovered] = useState(null);

  /* порядок исчезания: все ячейки + оба ряда заголовков */
  const order = useMemo(() => shuffledOrder(38), []);
  const gone = (rank) => order[rank] < goneCount;

  const hoverActive = hovered != null && goneCount === 0;

  const renderCell = (cell, rank) => {
    const cls = `cell${gone(rank) ? " gone" : ""}${
      hoverActive && !(cell.t === "w" && cell.i === hovered) ? " blurred" : ""
    }`;
    if (cell.t === "logo")
      return (
        <div className={`${cls} linkCell`} key={rank}>
          <Paren kind="[" />
          <Wordmark />
          <Paren kind="]" />
        </div>
      );
    if (cell.t === "arrow")
      return (
        <div
          className={`${cls} linkCell`}
          key={rank}
          style={{ cursor: "pointer" }}
          onClick={() =>
            smoothTo(window.innerHeight * (segStart("mainIn") + 0.7))
          }
        >
          <Paren kind="[" />
          <span className="arrowGlyph">↓</span>
          <Paren kind="]" />
        </div>
      );
    if (cell.t === "f") return <div className={cls} key={rank}><FactItem f={facts[cell.i]} /></div>;
    return (
      <div className={cls} key={rank}>
        <WorkItem
          w={works[cell.i]}
          onHover={() => setHovered(cell.i)}
          onLeave={() => setHovered(null)}
        />
      </div>
    );
  };

  let rank = 0;
  const topCells = heroTop.flatMap((row) => row.map((c) => renderCell(c, rank++)));
  const headingTopRank = rank++;
  const headingBottomRank = rank++;
  const bottomCells = heroBottom.flatMap((row) => row.map((c) => renderCell(c, rank++)));

  const ratio = hovered != null ? works[hovered].ratio : "3:4";
  const [iw, ih] = RATIO_SIZE[ratio] || [60, 80];

  return (
    <div
      className="layer"
      style={heroDone ? { visibility: "hidden", pointerEvents: "none" } : undefined}
    >
      <div className="heroGrid top">
        {topCells}
        <div
          className={`headingRow cell${gone(headingTopRank) ? " gone" : ""}${hoverActive ? " blurred" : ""}`}
        >
          <div className="half split">
            <span className="h1">дизайн</span>
            <span className="h1">медиа</span>
          </div>
          <div className="half">
            <span className="h1">,</span>
          </div>
        </div>
      </div>

      <div className="heroGrid bottom">
        <div
          className={`headingRow cell${gone(headingBottomRank) ? " gone" : ""}${hoverActive ? " blurred" : ""}`}
        >
          <div className="half" />
          <div className="half split">
            <span className="h1">которые</span>
            <span className="h1">читают</span>
          </div>
        </div>
        {bottomCells}
      </div>

      <p
        className={`heroLead lead${leadGone ? " gone" : ""}${hoverActive ? " blurred" : ""}`}
      >
        {heroLead}
      </p>

      {/* картинка активного проекта; пропорция любая, высота ≤ 800px */}
      <div
        className={`hoverImage${hoverActive ? " on" : ""}`}
        style={{ width: `${iw}rem`, height: `${ih}rem` }}
      >
        {hovered != null && works[hovered].image ? (
          <img
            className="photo"
            src={works[hovered].image.src}
            alt={works[hovered].title}
          />
        ) : (
          <div className="ph">{hovered != null ? works[hovered].title : ""}</div>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Основная сцена                                                     */
/* ------------------------------------------------------------------ */

const SKILL_HUES = [
  ["#2b2320", "#4a3a33"],
  ["#1d2430", "#37475c"],
  ["#2e1d2c", "#54364f"],
  ["#20301f", "#3d5c3a"],
  ["#30291d", "#5c4f37"],
  ["#1d3030", "#375c5c"],
];

const MainLayer = memo(function MainLayer({ ui, innerRef }) {
  const { mode, principleIdx, skillIdx, workCount, logoIdx } = ui;

  /* верхний лид: колонтитул + текст */
  const leadCfg =
    mode === "principles"
      ? { n: "o1", label: "экспертиза", text: expertiseLead }
      : mode === "clients"
      ? { n: "o3", label: "клиенты", text: clientsLead }
      : { n: "o2", label: "подход", text: approachLead };

  /* листинг «что мы умеем»: активный пункт встаёт на центральную
     линию — его цифра на уровне большого заголовка */
  const skillRefs = useRef([]);
  const [skillShift, setSkillShift] = useState(0);
  useLayoutEffect(() => {
    const el = skillRefs.current[skillIdx];
    if (!el) return;
    const remPx = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    /* линия = верх строки больших слов (центр минус полстроки h1),
       минус top колонки (27.4rem) */
    const line = window.innerHeight / 2 - 4 * remPx - 27.4 * remPx;
    setSkillShift(el.offsetTop - Math.max(0, line));
  }, [skillIdx]);

  const pr = principles[principleIdx];
  const activeBrand = brands[logoIdx];
  const quote = testimonials[activeBrand.id];

  return (
    <div
      ref={innerRef}
      className="layer mainLayer"
      style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
    >
      {/* верхний лид */}
      <div className="sectionLead">
        <div key={leadCfg.n} className="swapWord" style={{ display: "block" }}>
          <p className="lead leadText">{leadCfg.text}</p>
          <div className="marker caption">
            <div>{leadCfg.n}</div>
            <div>{leadCfg.label}</div>
          </div>
        </div>
      </div>

      {/* ---- принципы (1)(2)(3) ---- */}
      <div
        className={`numTag fadeBlock${mode === "principles" ? "" : " hiddenUp"}`}
        style={{ left: pr.numPos }}
      >
        <Paren kind="(" />
        <Swap text={String(principleIdx + 1)} />
        <Paren kind=")" />
      </div>

      <div
        className={`principleText body fadeBlock${mode === "principles" ? "" : " hidden"}`}
        style={{
          left:
            pr.textPos === "left"
              ? "1.2rem"
              : pr.textPos === "center"
              ? "calc(33.33% + 0.8rem)"
              : "calc(66.67% + 0.4rem)",
        }}
      >
        <div key={principleIdx} className="swapWord" style={{ display: "block" }}>
          {pr.paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>

      {/* ---- что мы умеем ---- */}
      <div className={`skillsCol fadeBlock${mode === "skills" ? "" : mode === "principles" ? " hidden" : " hiddenUp"}`}>
        <div
          className="skillsInner"
          style={{ transform: `translateY(-${skillShift}px)` }}
        >
          {skills.map((s, i) => (
            <div
              key={i}
              className="skillItem"
              ref={(el) => (skillRefs.current[i] = el)}
              style={{
                /* проеханные пункты исчезают целиком, будущие приглушены */
                opacity: i < skillIdx ? 0 : i === skillIdx ? 1 : 0.35,
                transition: "opacity .45s ease",
              }}
            >
              <div className="num">
                <Paren kind="(" />
                <span className="h1">{i + 1}</span>
                <Paren kind=")" />
              </div>
              <div className="body" style={{ textTransform: "uppercase" }}>{s.title}</div>
              <div className="body">{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* картинка/видео слева — меняется по активному пункту */}
      <div className={`skillsImage fadeBlock${mode === "skills" ? "" : mode === "principles" ? " hidden" : " hiddenUp"}`}>
        {skills.map((s, i) => (
          <div
            key={i}
            className={`ph${i === skillIdx ? " on" : ""}`}
            style={{
              background: `linear-gradient(160deg, ${SKILL_HUES[i][0]}, ${SKILL_HUES[i][1]})`,
            }}
          >
            {`0${i + 1}`}
          </div>
        ))}
      </div>

      {/* ---- как мы работаем ---- */}
      <div className="workModes">
        {workModes.map((m, i) => (
          <div
            key={i}
            className={`workMode fadeBlock${mode === "work" && workCount > i ? "" : mode === "clients" ? " hiddenUp" : " hidden"}`}
            style={{ transitionDelay: mode === "work" ? `${i * 60}ms` : "0ms" }}
          >
            <div className="num">
              <Paren kind="(" />
              <span className="h1">{i + 1}</span>
              <Paren kind=")" />
            </div>
            <div className="body" style={{ textTransform: "uppercase" }}>{m.title}</div>
            <div className="body">{m.text}</div>
          </div>
        ))}
      </div>

      {/* ---- клиенты ---- */}
      <div className={`logosCol fadeBlock${mode === "clients" ? "" : " hidden"}`}>
        <div
          className="logosInner"
          style={{ transform: `translateY(-${logoIdx * 8}rem)` }}
        >
          {brands.map((b) => (
            <div className="logoRow" key={b.id}>
              <span className="brandPh">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`logosParens fadeBlock${mode === "clients" ? "" : " hidden"}`}>
        <Paren kind="(" />
        <Paren kind=")" />
      </div>

      <div className={`testimonial fadeBlock${mode === "clients" && quote ? "" : " hidden"}`}>
        {quote && (
          <div key={activeBrand.id} className="swapWord" style={{ display: "block" }}>
            <div className="author caption">
              <div className="avatar" />
              <div>
                <div>{quote.author}</div>
                <div style={{ textTransform: "none" }}>{quote.role}</div>
              </div>
            </div>
            <div className="quote body">
              {quote.paragraphs.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Большие слова — отдельный слой: не ездит со скроллом,             */
/*  всегда по центру, слова просто проявляются                         */
/* ------------------------------------------------------------------ */

const MotoLayer = memo(function MotoLayer({ ui, innerRef }) {
  const { mode, principleIdx } = ui;

  const words =
    mode === "principles"
      ? principles[principleIdx].words
      : mode === "skills"
      ? ["что", "мы", "умеем"]
      : mode === "work"
      ? ["как", "мы", "работаем"]
      : ["нам", "доверяют", ""];

  return (
    <div
      ref={innerRef}
      className="motoLayer"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <div
        className="moto"
        style={mode === "skills" ? { right: "calc(33.33% + 0.4rem)" } : undefined}
      >
        {words.map((w, i) => (
          <span className="slot" key={i}>
            {w ? (
              <Fade text={w} />
            ) : (
              <span className="h1" style={{ opacity: 0 }}>.</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Контакты — красная шторка                                          */
/* ------------------------------------------------------------------ */

const ContactsLayer = memo(function ContactsLayer({ innerRef }) {
  return (
    <div
      ref={innerRef}
      className="contacts"
      style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
    >
      <div className="sectionLead">
        <p className="lead leadText">{contactsLead}</p>
        <div className="marker caption">
          <div>o3</div>
          <div>контакты</div>
        </div>
      </div>

      <div className="moto">
        <span className="slot"><span className="h1">обсудим</span></span>
        <span className="slot"><span className="h1">ваш</span></span>
        <span className="slot"><span className="h1">проект</span></span>
      </div>

      <a className="contactLink" href="mailto:hello@charmer.design">
        <Paren kind="[" />
        <span className="arrowGlyph">→</span>
        <Paren kind="]" />
        <Wordmark height="6.4rem" />
      </a>

      <div className="footerGrid caption">
        {footerCols.map((t2, i) => (
          <div key={i}>{t2}</div>
        ))}
        <div className="low">charmer.design</div>
        <div className="low">hello@charmer.design</div>
        <div className="low">
          <span>TG, IN, be</span>
          <span>© 2013-2026</span>
        </div>
      </div>

      <button
        className="toTop caption"
        onClick={() => smoothTo(0)}
      >
        наверх
      </button>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Мобильная статичная версия                                         */
/* ------------------------------------------------------------------ */

/* Мобильный заголовок секции: колонтитул + лид */
function MHeader({ n, label, text }) {
  return (
    <>
      <div className="caption mHead">
        <div>{n}</div>
        <div>{label}</div>
      </div>
      <p className="lead mLead">{text}</p>
    </>
  );
}

/* Число (N) в скобках; align: left | center | right */
function MNumber({ n, align = "left" }) {
  return (
    <div className={`mNum mNum-${align}`}>
      <Paren kind="(" />
      <span className="mWord">{n}</span>
      <Paren kind=")" />
    </div>
  );
}

function Mobile() {
  return (
    <div className="mobile">
      {/* ---------- хиро: лента проектов + слова ---------- */}
      <section className="mHero">
        <div className="mCards">
          {works.slice(0, 6).map((w) => (
            <div className="mCard" key={w.id}>
              <WorkItem w={w} />
              <div className="mCardImage">
                {w.image ? (
                  <img src={w.image.src} alt={w.title} />
                ) : (
                  <div className="ph" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mStagger">
          <div className="mWord mRowLeft">дизайн</div>
          <div className="mRowSplit">
            <span className="mWord">медиа</span>
            <span className="mWord">,</span>
          </div>
        </div>
        <p className="lead mLead">{heroLead}</p>
        <div className="mStagger">
          <div className="mWord mRowLeft">которые</div>
          <div className="mWord mRowRight">читают</div>
        </div>
      </section>

      {/* ---------- o1 экспертиза: три принципа ---------- */}
      <section>
        <MHeader n="o1" label="экспертиза" text={expertiseLead} />
        {principles.map((pr, i) => (
          <div className="mPrinciple" key={i}>
            <MNumber n={i + 1} align={["left", "center", "right"][i]} />
            <div className="mStagger">
              <div className="mWord mRowLeft">{pr.words[0]}</div>
              <div className="mWord mRowCenter">{pr.words[1]}</div>
              <div className="mWord mRowRight">{pr.words[2]}</div>
            </div>
            <div className="mBody">
              {pr.paragraphs.map((t, j) => (
                <p className="body" key={j}>{t}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ---------- o2 подход: умеем + работаем ---------- */}
      <section>
        <MHeader n="o2" label="подход" text={approachLead} />
        <div className="mSkillsHero">
          <div className="mSkillsPhoto">
            {works[0].image ? (
              <img src={works[0].image.src} alt="" />
            ) : (
              <div className="ph" />
            )}
          </div>
          <div className="mStagger over">
            <div className="mWord mRowLeft">что</div>
            <div className="mWord mRowCenter">мы</div>
            <div className="mWord mRowRight">умеем</div>
          </div>
        </div>
        <div className="mSwipe">
          {skills.map((s, i) => (
            <div className="mSwipeCard" key={i}>
              <MNumber n={i + 1} />
              <div className="body mTitle">{s.title}</div>
              <p className="body">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mStagger" style={{ marginTop: "6.4rem" }}>
          <div className="mWord mRowLeft">как</div>
          <div className="mWord mRowCenter">мы</div>
          <div className="mWord mRowRight">работаем</div>
        </div>
        <div className="mSwipe">
          {workModes.map((m, i) => (
            <div className="mSwipeCard" key={i}>
              <MNumber n={i + 1} />
              <div className="body mTitle">{m.title}</div>
              <p className="body">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- контакты ---------- */}
      <section className="mContacts">
        <MHeader n="o3" label="контакты" text={contactsLead} />
        <div className="mStagger">
          <div className="mWord mRowLeft">обсудим</div>
          <div className="mWord mRowCenter">ваш</div>
          <div className="mWord mRowRight">проект</div>
        </div>
        <a className="mArrow" href="mailto:hello@charmer.design" aria-label="Написать нам">
          <Paren kind="[" />
          <span className="mWord">→</span>
          <Paren kind="]" />
        </a>
        <div className="mFooter caption">
          {footerCols.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          <div className="mFooterLinks">
            <div>charmer.design</div>
            <div>hello@charmer.design</div>
            <div className="mFooterRow">
              <span>TG, IN, be</span>
              <span>© 2013-2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Страница                                                           */
/* ------------------------------------------------------------------ */

/* Дискретные состояния сцены — React рендерится только при их смене */
function computeUi(p) {
  const fade = seg(p, "heroFade");
  const mode = !after(p, "p3")
    ? "principles"
    : !after(p, "skillsRun")
    ? "skills"
    : !after(p, "workRun")
    ? "work"
    : "clients";
  return {
    goneCount: Math.floor(fade * 40),
    leadGone: fade > 0.85,
    heroDone: after(p, "heroFade"),
    mode,
    principleIdx: seg(p, "p3") > 0 ? 2 : seg(p, "p2") > 0 ? 1 : 0,
    skillIdx: Math.min(
      5,
      seg(p, "skillsIn") < 1 ? 0 : Math.floor(seg(p, "skillsRun") * 5.999)
    ),
    workCount:
      mode !== "work"
        ? 0
        : seg(p, "workRun") > 0
        ? Math.min(4, 2 + Math.floor(seg(p, "workRun") * 3))
        : 1,
    logoIdx: Math.min(
      brands.length - 1,
      Math.floor(seg(p, "logosRun") * brands.length)
    ),
  };
}

export default function Page() {
  const [ui, setUi] = useState(() => computeUi(0));
  const mainRef = useRef(null);
  const motoRef = useRef(null);
  const contactsRef = useRef(null);

  useEffect(() => {
    /* Lenis виртуализирует колесо и сам плавно ведёт скролл страницы —
       всё движение получает инерцию, как на charmerstudio.com.
       Наш rAF-цикл читает уже сглаженное значение: и шторки,
       и дискретные переключения приезжают с той же инерцией. */
    const isDesktop = window.matchMedia("(min-width: 901px)").matches;
    const lenis = isDesktop
      ? new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 1 })
      : null;
    window.__lenis = lenis;

    let raf = 0;
    let prevUi = null;

    const apply = (el, t) => {
      if (!el) return;
      el.style.transform = `translate3d(0, ${(1 - t) * 100}vh, 0)`;
      el.style.visibility = t <= 0.001 ? "hidden" : "visible";
    };

    const tick = (now) => {
      if (lenis) lenis.raf(now);
      const smooth =
        (lenis ? lenis.scroll : window.scrollY) / window.innerHeight;

      const mainT = seg(smooth, "mainIn");
      const contactsT = seg(smooth, "contactsIn");
      apply(mainRef.current, mainT);
      apply(contactsRef.current, contactsT);

      /* слова: проявляются, когда шторка почти доехала; гаснут под контактами */
      if (motoRef.current) {
        const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const o = clamp((mainT - 0.6) * 2.5) * (1 - clamp(contactsT * 1.6));
        motoRef.current.style.opacity = String(o);
        motoRef.current.style.visibility = o <= 0.001 ? "hidden" : "visible";
      }

      const next = computeUi(smooth);
      if (
        !prevUi ||
        next.goneCount !== prevUi.goneCount ||
        next.leadGone !== prevUi.leadGone ||
        next.heroDone !== prevUi.heroDone ||
        next.mode !== prevUi.mode ||
        next.principleIdx !== prevUi.principleIdx ||
        next.skillIdx !== prevUi.skillIdx ||
        next.workCount !== prevUi.workCount ||
        next.logoIdx !== prevUi.logoIdx
      ) {
        prevUi = next;
        setUi(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (lenis) lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <main>
      <div className="scroller" style={{ height: `calc(${TOTAL} * 100vh + 100vh)` }}>
        <div className="stage">
          <HeroLayer
            goneCount={ui.goneCount}
            leadGone={ui.leadGone}
            heroDone={ui.heroDone}
          />
          <MainLayer ui={ui} innerRef={mainRef} />
          <MotoLayer ui={ui} innerRef={motoRef} />
          <ContactsLayer innerRef={contactsRef} />
        </div>
      </div>
      <Mobile />
    </main>
  );
}
