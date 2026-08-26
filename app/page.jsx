"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
            window.scrollTo({
              top: window.innerHeight * (segStart("mainIn") + 0.7),
              behavior: "smooth",
            })
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
        <div className="ph">{hovered != null ? works[hovered].title : ""}</div>
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

  /* большие слова */
  const motoWords =
    mode === "principles"
      ? principles[principleIdx].words
      : mode === "skills"
      ? ["что", "мы", "умеем"]
      : mode === "work"
      ? ["как", "мы", "работаем"]
      : ["нам", "доверяют", ""];

  const motoStyle =
    mode === "skills"
      ? { right: "calc(33.33% + 0.4rem)" }
      : mode === "clients"
      ? { top: "54rem" }
      : undefined;

  /* листинг «что мы умеем»: подвозим активный пункт к верху колонки */
  const skillRefs = useRef([]);
  const [skillShift, setSkillShift] = useState(0);
  useLayoutEffect(() => {
    const el = skillRefs.current[skillIdx];
    if (el) setSkillShift(el.offsetTop);
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

      {/* большие слова */}
      <div className="moto" style={motoStyle}>
        {motoWords.map((w, i) => (
          <span className="slot" key={i}>
            {w ? <Swap text={w} /> : <span className="h1" style={{ opacity: 0 }}>.</span>}
          </span>
        ))}
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
              style={{ opacity: i <= skillIdx ? 1 : 0.35, transition: "opacity .4s" }}
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
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        наверх
      </button>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Мобильная статичная версия                                         */
/* ------------------------------------------------------------------ */

function Mobile() {
  return (
    <div className="mobile">
      <section>
        <div className="linkCell">
          <Paren kind="[" />
          <Wordmark />
          <Paren kind="]" />
        </div>
        <div className="mGrid">
          {works.slice(0, 2).map((w) => (
            <WorkItem key={w.id} w={w} />
          ))}
        </div>
        <div className="mWords">
          <span className="h1">дизайн</span>
          <span className="h1">медиа,</span>
          <span className="h1">которые</span>
          <span className="h1">читают</span>
        </div>
        <p className="lead">{heroLead}</p>
      </section>

      <section>
        <div className="caption">
          <div>o1</div>
          <div>экспертиза</div>
        </div>
        <p className="lead" style={{ margin: "1.6rem 0" }}>{expertiseLead}</p>
        {principles.map((pr, i) => (
          <div className="mItem" key={i}>
            <div className="num" style={{ display: "flex", alignItems: "center" }}>
              <Paren kind="(" />
              <span className="h1">{i + 1}</span>
              <Paren kind=")" />
            </div>
            <div className="mWords">
              {pr.words.map((w) => (
                <span className="h1" key={w}>{w}</span>
              ))}
            </div>
            {pr.paragraphs.map((t, j) => (
              <p className="body" key={j}>{t}</p>
            ))}
          </div>
        ))}
      </section>

      <section>
        <div className="caption">
          <div>o2</div>
          <div>подход</div>
        </div>
        <p className="lead" style={{ margin: "1.6rem 0" }}>{approachLead}</p>
        <div className="mWords">
          <span className="h1">что</span>
          <span className="h1">мы</span>
          <span className="h1">умеем</span>
        </div>
        {skills.map((s, i) => (
          <div className="mItem" key={i}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Paren kind="(" />
              <span className="h1">{i + 1}</span>
              <Paren kind=")" />
            </div>
            <div className="body" style={{ textTransform: "uppercase" }}>{s.title}</div>
            <p className="body">{s.text}</p>
          </div>
        ))}
        <div className="mWords">
          <span className="h1">как</span>
          <span className="h1">мы</span>
          <span className="h1">работаем</span>
        </div>
        {workModes.map((m, i) => (
          <div className="mItem" key={i}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Paren kind="(" />
              <span className="h1">{i + 1}</span>
              <Paren kind=")" />
            </div>
            <div className="body" style={{ textTransform: "uppercase" }}>{m.title}</div>
            <p className="body">{m.text}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="caption">
          <div>o3</div>
          <div>клиенты</div>
        </div>
        <p className="lead" style={{ margin: "1.6rem 0" }}>{clientsLead}</p>
        <div className="mWords">
          <span className="h1">нам</span>
          <span className="h1">доверяют</span>
        </div>
        <div className="mGrid">
          {brands.map((b) => (
            <div className="logoRow" key={b.id}>
              <span className="brandPh">{b.name}</span>
            </div>
          ))}
        </div>
        {testimonials.tochka && (
          <div className="mItem">
            <div className="caption">{testimonials.tochka.author}</div>
            <div className="caption" style={{ textTransform: "none" }}>
              {testimonials.tochka.role}
            </div>
            {testimonials.tochka.paragraphs.map((t, i) => (
              <p className="body" key={i}>{t}</p>
            ))}
          </div>
        )}
      </section>

      <section className="mContacts">
        <div className="caption">
          <div>o3</div>
          <div>контакты</div>
        </div>
        <p className="lead" style={{ margin: "1.6rem 0" }}>{contactsLead}</p>
        <div className="mWords">
          <span className="h1">обсудим</span>
          <span className="h1">ваш</span>
          <span className="h1">проект</span>
        </div>
        <a className="linkCell" href="mailto:hello@charmer.design" style={{ justifyContent: "center", gap: "1rem" }}>
          <Paren kind="[" />
          <span className="arrowGlyph">→</span>
          <Paren kind="]" />
          <Wordmark />
        </a>
        {footerCols.map((t, i) => (
          <p className="caption" key={i} style={{ margin: "1.2rem 0" }}>{t}</p>
        ))}
        <div className="caption" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>charmer.design</span>
          <span>hello@charmer.design</span>
        </div>
        <div className="caption" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>TG, IN, be</span>
          <span>© 2013-2026</span>
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
  const contactsRef = useRef(null);

  useEffect(() => {
    /* Один rAF-цикл: непрерывные движения пишутся напрямую в DOM
       со сглаживанием (инерция), React получает только дискретные
       переключения. Так скролл остаётся плавным. */
    let raf = 0;
    let smooth = window.scrollY / window.innerHeight;
    let last = performance.now();
    let prevUi = null;

    const apply = (el, t) => {
      if (!el) return;
      el.style.transform = `translate3d(0, ${(1 - t) * 100}vh, 0)`;
      el.style.visibility = t <= 0.001 ? "hidden" : "visible";
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = window.scrollY / window.innerHeight;

      /* экспоненциальное сглаживание, независимое от FPS */
      smooth += (target - smooth) * (1 - Math.exp(-dt * 10));
      if (Math.abs(target - smooth) < 0.0004) smooth = target;

      apply(mainRef.current, seg(smooth, "mainIn"));
      apply(contactsRef.current, seg(smooth, "contactsIn"));

      const next = computeUi(target);
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
    return () => cancelAnimationFrame(raf);
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
          <ContactsLayer innerRef={contactsRef} />
        </div>
      </div>
      <Mobile />
    </main>
  );
}
