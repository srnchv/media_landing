"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { shuffledOrder } from "../lib/timeline";
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

/* Программный переход к шагу сцены (стрелка ↓, «наверх») */
function goToStep(n) {
  if (window.__goToStep) window.__goToStep(n);
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

const HeroLayer = memo(function HeroLayer({ heroGone, heroDone }) {
  const [hovered, setHovered] = useState(null);

  /* порядок исчезания: все ячейки + оба ряда заголовков */
  const order = useMemo(() => shuffledOrder(38), []);
  const gone = () => heroGone;
  /* «шахматный» каскад: у каждой ячейки своя задержка исчезания */
  const delay = (rank) => ({ transitionDelay: heroGone ? `${order[rank] * 22}ms` : "0ms" });

  const hoverActive = hovered != null && !heroGone;

  const renderCell = (cell, rank) => {
    const cls = `cell${gone(rank) ? " gone" : ""}${
      hoverActive && !(cell.t === "w" && cell.i === hovered) ? " blurred" : ""
    }`;
    if (cell.t === "logo")
      return (
        <div className={`${cls} linkCell`} key={rank} style={delay(rank)}>
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
          style={{ ...delay(rank), cursor: "pointer" }}
          onClick={() => goToStep(1)}
        >
          <Paren kind="[" />
          <span className="arrowGlyph">↓</span>
          <Paren kind="]" />
        </div>
      );
    if (cell.t === "f") return <div className={cls} key={rank} style={delay(rank)}><FactItem f={facts[cell.i]} /></div>;
    return (
      <div className={cls} key={rank} style={delay(rank)}>
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
          style={delay(headingTopRank)}
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
          style={delay(headingBottomRank)}
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
        className={`heroLead lead${heroGone ? " gone" : ""}${hoverActive ? " blurred" : ""}`}
        style={{ transitionDelay: heroGone ? "350ms" : "0ms" }}
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

  /* стопка «что мы умеем»: активный пункт на линии слов,
     прошлые уезжают вверх бледной лесенкой, будущие скрыты снизу */
  const skillRefs = useRef([]);
  const [skillOffsets, setSkillOffsets] = useState([]);
  useLayoutEffect(() => {
    const remPx = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const gap = 4 * remPx;
    const hs = skillRefs.current.map((el) => (el ? el.offsetHeight : 0));
    setSkillOffsets(
      skills.map((_, i) => {
        if (i === skillIdx) return 0;
        if (i < skillIdx) {
          let sum = 0;
          for (let j = i; j < skillIdx; j++) sum -= hs[j] + gap;
          return sum;
        }
        return 8 * remPx;
      })
    );
  }, [skillIdx]);

  /* стопка текстов принципов: активный внизу, призраки над ним */
  const prRefs = useRef([]);
  const [prOffsets, setPrOffsets] = useState([]);
  useLayoutEffect(() => {
    const remPx = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const gap = 2.4 * remPx;
    const hs = prRefs.current.map((el) => (el ? el.offsetHeight : 0));
    setPrOffsets(
      principles.map((_, i) => {
        if (i === principleIdx) return 0;
        if (i < principleIdx) {
          let sum = 0;
          for (let j = i + 1; j <= principleIdx; j++) sum -= hs[j] + gap;
          return sum;
        }
        return 6 * remPx;
      })
    );
  }, [principleIdx]);

  const pr = principles[principleIdx];
  const activeBrand = brands[logoIdx];
  const quote = testimonials[activeBrand.id];

  return (
    <div
      ref={innerRef}
      className="layer mainLayer"
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

      {/* ---- принципы: (N) по центру над строкой слов ---- */}
      <div
        className={`numTag fadeBlock${mode === "principles" ? "" : " hiddenUp"}`}
        style={{ left: "50%" }}
      >
        <Paren kind="(" />
        <Swap text={String(principleIdx + 1)} />
        <Paren kind=")" />
      </div>

      {/* текст принципа: внизу справа, смена двойной экспозицией */}
      <div className={`principleStack fadeBlock${mode === "principles" ? "" : " hidden"}`}>
        {principles.map((pr, i) => (
          <div
            key={i}
            ref={(el) => (prRefs.current[i] = el)}
            className={`prText body ${
              i === principleIdx ? "cur" : i < principleIdx ? `g${principleIdx - i}` : "nxt"
            }`}
            style={{ transform: `translateY(${prOffsets[i] ?? 0}px)` }}
          >
            {pr.paragraphs.map((t, j) => (
              <p key={j}>{t}</p>
            ))}
          </div>
        ))}
      </div>

      {/* ---- что мы умеем: карточки на линии слов ---- */}
      <div className={`skillsStack fadeBlock${mode === "skills" ? "" : mode === "principles" ? " hidden" : " hiddenUp"}`}>
        {skills.map((s, i) => (
          <div
            key={i}
            ref={(el) => (skillRefs.current[i] = el)}
            className={`skillCard${i < skillIdx ? " past" : i > skillIdx ? " future" : ""}`}
            style={{
              transform: `translateY(${skillOffsets[i] ?? (i === skillIdx ? 0 : 80)}px)`,
            }}
          >
            <div className="num">
              <Paren kind="(" />
              <span className="h1">{i + 1}</span>
              <Paren kind=")" />
            </div>
            <div className="body skillTitle">{s.title}</div>
            <div className="body">{s.text}</div>
          </div>
        ))}
      </div>

      {/* планшет с живым контентом — лента листается по активному пункту */}
      <div className={`tablet fadeBlock${mode === "skills" ? "" : mode === "principles" ? " hidden" : " hiddenUp"}`}>
        <div className="tabletScreen">
          <div
            className="tabletFeed"
            style={{ transform: `translateY(-${skillIdx * 100}%)` }}
          >
            {skills.map((s, i) => (
              <div
                className="tabletSlide"
                key={i}
                style={{
                  background: `linear-gradient(160deg, ${SKILL_HUES[i][0]}, ${SKILL_HUES[i][1]})`,
                }}
              >
                {i === 0 && works[0].image ? (
                  <img src={works[0].image.src} alt="" />
                ) : (
                  <span>{`0${i + 1}`}</span>
                )}
              </div>
            ))}
          </div>
        </div>
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
    mode === "skills"
      ? ["что", "мы", "умеем"]
      : mode === "work"
      ? ["как", "мы", "работаем"]
      : ["нам", "доверяют", ""];

  return (
    <div
      ref={innerRef}
      className="motoLayer"
    >
      {mode === "principles" ? (
        /* принципы: слова со стопкой бледных размытых призраков сверху */
        <div className="moto">
          {[0, 1, 2].map((slot) => (
            <span className={`slot stackSlot slot${slot}`} key={slot}>
              {slot === 1 ? (
                <span className="stackWord cur">
                  <span className="h1">как</span>
                </span>
              ) : (
                principles.map((pr, i) => (
                  <span
                    key={i}
                    className={`stackWord ${
                      i === principleIdx
                        ? "cur"
                        : i < principleIdx
                        ? `g${principleIdx - i}`
                        : "nxt"
                    }`}
                  >
                    <span className="h1">{pr.words[slot]}</span>
                  </span>
                ))
              )}
            </span>
          ))}
        </div>
      ) : (
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
      )}
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
        onClick={() => goToStep(0)}
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

/* ------------------------------------------------------------------ */
/*  Пошаговая сцена: один жест = один шаг (как на unionspaces.co.uk)  */
/* ------------------------------------------------------------------ */

/* Линейный список состояний страницы */
const STEPS = [
  { k: "hero" },
  ...principles.map((_, i) => ({ k: "p", i })),
  ...skills.map((_, i) => ({ k: "s", i })),
  ...workModes.map((_, i) => ({ k: "w", i })),
  ...brands.map((_, i) => ({ k: "l", i })),
  { k: "c" },
];
const LAST = STEPS.length - 1;

function uiForStep(n) {
  const st = STEPS[n];
  const mode =
    st.k === "p" || st.k === "hero"
      ? "principles"
      : st.k === "s"
      ? "skills"
      : st.k === "w"
      ? "work"
      : "clients";
  return {
    step: n,
    heroGone: n > 0,
    heroDone: n > 1,
    mainIn: n > 0,
    contactsIn: st.k === "c",
    mode,
    principleIdx: st.k === "p" ? st.i : st.k === "hero" ? 0 : principles.length - 1,
    skillIdx: st.k === "s" ? st.i : mode === "skills" ? 0 : n < 1 + principles.length ? 0 : skills.length - 1,
    workCount: st.k === "w" ? st.i + 1 : mode === "work" ? 1 : 0,
    logoIdx: st.k === "l" ? st.i : st.k === "c" ? brands.length - 1 : 0,
  };
}

const STEP_LOCK_MS = 1000;

export default function Page() {
  const [ui, setUi] = useState(() => uiForStep(0));
  const stepRef = useRef(0);
  const lockRef = useRef(0);
  const mainRef = useRef(null);
  const motoRef = useRef(null);
  const contactsRef = useRef(null);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 901px)").matches;
    if (!isDesktop) return;

    const go = (n) => {
      const next = Math.max(0, Math.min(LAST, n));
      if (next === stepRef.current) return;
      stepRef.current = next;
      lockRef.current = performance.now() + STEP_LOCK_MS;
      setUi(uiForStep(next));
    };
    window.__goToStep = go;

    /* колесо/тачпад: реагируем только на начало жеста (ускорение),
       хвост инерции игнорируем — так один взмах даёт ровно один шаг */
    const recent = [];
    let lastWheelAt = 0;
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      const d = Math.abs(e.deltaY);
      if (now - lastWheelAt > 120) recent.length = 0;
      lastWheelAt = now;
      const avg = recent.length
        ? recent.reduce((a, b) => a + b, 0) / recent.length
        : 0;
      recent.push(d);
      if (recent.length > 6) recent.shift();
      if (now < lockRef.current) return;
      const accelerating = recent.length < 2 || d >= avg;
      if (d > 3 && accelerating) go(stepRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    const onKey = (e) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (performance.now() >= lockRef.current) go(stepRef.current + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (performance.now() >= lockRef.current) go(stepRef.current - 1);
      }
    };

    let touchY = null;
    const onTouchStart = (e) => (touchY = e.touches[0].clientY);
    const onTouchEnd = (e) => {
      if (touchY == null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) > 40 && performance.now() >= lockRef.current)
        go(stepRef.current + (dy > 0 ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.__goToStep = null;
    };
  }, []);

  /* слои двигаются CSS-переходами по классам состояния */
  useEffect(() => {
    const m = mainRef.current;
    const c = contactsRef.current;
    const w = motoRef.current;
    if (m) m.classList.toggle("in", ui.mainIn);
    if (c) c.classList.toggle("in", ui.contactsIn);
    if (w) w.classList.toggle("in", ui.mainIn && !ui.contactsIn);
  }, [ui.mainIn, ui.contactsIn]);

  return (
    <main data-step={ui.step}>
      <div className="scroller">
        <div className="stage">
          <HeroLayer heroGone={ui.heroGone} heroDone={ui.heroDone} />
          <MainLayer ui={ui} innerRef={mainRef} />
          <MotoLayer ui={ui} innerRef={motoRef} />
          <ContactsLayer innerRef={contactsRef} />
        </div>
      </div>
      <Mobile />
    </main>
  );
}
