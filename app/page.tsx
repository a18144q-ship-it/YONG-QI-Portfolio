"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const asset = (folder: string, number: number) => `/v2/${folder}/${String(number).padStart(2, "0")}.webp`;
const previewAsset = (src: string) => `/preview${src.replace(/\.(?:png|jpe?g|webp|gif)$/i, ".webp")}`;
const retryAsset = (src: string, attempt: number) => `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;
const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function ResponsiveImage({ src, alt, loading = "lazy", ariaHidden = false, className = "" }: { src: string; alt: string; loading?: "eager" | "lazy"; ariaHidden?: boolean; className?: string }) {
  const pictureRef = useRef<HTMLPictureElement>(null);
  const retryTimerRef = useRef(0);
  const [active, setActive] = useState(loading === "eager");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [useOriginal, setUseOriginal] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(loading === "eager" ? "loading" : "idle");
  const previewSrc = previewAsset(src);
  const baseSrc = useOriginal ? src : previewSrc;
  const currentSrc = retryAttempt ? retryAsset(baseSrc, retryAttempt) : baseSrc;

  useEffect(() => {
    if (active) return;
    const picture = pictureRef.current;
    if (!picture || !("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setStatus("loading");
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "1800px 0px", threshold: 0.01 });
    observer.observe(picture);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => () => window.clearTimeout(retryTimerRef.current), []);

  const retry = () => {
    setStatus("loading");
    if (retryAttempt < 1) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = window.setTimeout(() => setRetryAttempt((value) => value + 1), (retryAttempt + 1) * 350);
      return;
    }
    if (!useOriginal) {
      setUseOriginal(true);
      setRetryAttempt(0);
      return;
    }
    if (retryAttempt < 2) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = window.setTimeout(() => setRetryAttempt((value) => value + 1), 500);
      return;
    }
    setStatus("error");
  };

  return <picture ref={pictureRef} className={`responsive-picture is-${status} ${className}`}>
    <img
      src={active ? currentSrc : transparentPixel}
      data-preload-src={previewSrc}
      data-full-src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority={loading === "eager" ? "high" : "auto"}
      aria-hidden={ariaHidden || undefined}
      onLoad={active ? () => setStatus("loaded") : undefined}
      onError={active ? retry : undefined}
    />
  </picture>;
}

const catalogue = [
  { href: "#aure", id: "01", title: "耳机视觉", sub: "AURE BUDS PRO", image: asset("aure", 1), className: "case-aure" },
  { href: "#ssww", id: "02", title: "卫浴视觉", sub: "SSWW BATH", image: asset("ssww", 1), className: "case-ssww" },
  { href: "#crossborder", id: "03", title: "皮卡防滚架", sub: "TRUCK ROLL BAR", image: "/v2/crossborder/truck-roll-bar/02.jpg", className: "case-crossborder" },
  { href: "#renders", id: "04", title: "产品渲染", sub: "PRODUCT RENDERS", image: asset("renders", 7), className: "case-renders" },
  { href: "#aigc", id: "05", title: "AI视觉设计", sub: "IMAGE · AI", image: asset("aigc", 7), className: "case-aigc" },
];

type RenderItem = number | { src: string; alt: string; orientation: "wide" | "square" | "tall" };
type RenderGroup = { index: string; title: string; sub: string; images: RenderItem[]; layout: string; model?: boolean };

const renderGroups: RenderGroup[] = [
  { index: "01", title: "PRODUCT STUDIES", sub: "单品渲染", images: [3, 4, 5, 6, { src: "/v2/renders/watch/detail-01.webp", alt: "机械腕表表冠与测速刻度细节渲染", orientation: "wide" }, { src: "/v2/renders/watch/detail-02.webp", alt: "机械腕表表盘与机芯细节渲染", orientation: "wide" }], layout: "product-study" },
  { index: "02", title: "HOME RENDERING", sub: "家居渲染", images: [9, 10, { src: "/v2/renders/home/green-sofa.webp", alt: "绿色休闲沙发家居场景渲染", orientation: "tall" }, 21, 19, 27, 24, 30], layout: "home" },
  { index: "03", title: "DAILY CARE RENDERING", sub: "日化品渲染", images: [
    { src: "/v2/renders/07.webp", alt: "琥珀香水产品场景渲染", orientation: "square" },
    { src: "/v2/renders/08.webp", alt: "蓝色护肤品产品场景渲染", orientation: "square" },
    { src: "/v2/renders/daily-care/perfume-detail.webp", alt: "琥珀香水悬浮液滴产品渲染", orientation: "tall" },
    { src: "/v2/renders/daily-care/perfume-motion.gif", alt: "琥珀香水动态产品渲染", orientation: "tall" },
  ], layout: "daily-care" },
  { index: "04", title: "WHITE MODEL STUDY", sub: "产品建模白模展示", images: [32, 33, 34, 35, 36, 37], layout: "model-study", model: true },
];

const aiGroups = [
  { index: "01", kind: "product", title: "产品场景生成", note: "AI Product Scenes · Product & Environment", images: [8, 9, 10, 11, 12, 13, 14, 15] },
];

const aiImageProcessGroups = [
  { id: "01", folder: "set-01", orientation: "landscape", kind: "vehicle", product: "红色越野车", steps: [
    { number: "01", file: "01.jpg", title: "三维基底", note: "3D BASE RENDER" },
    { number: "02", file: "02.jpg", title: "场景生成", note: "AI ENVIRONMENT BUILD" },
    { number: "03", file: "03.jpg", title: "精修成片", note: "FINAL IMAGE" },
  ] },
  { id: "02", folder: "set-03", orientation: "landscape", kind: "vehicle", product: "蓝色皮卡", steps: [
    { number: "01", file: "01.jpg", title: "产品基底", note: "PRODUCT BASE" },
    { number: "02", file: "02.jpg", title: "场景合成", note: "SCENE COMPOSITING" },
    { number: "03", file: "03.jpg", title: "最终成片", note: "FINAL IMAGE" },
  ] },
  { id: "03", folder: "set-02", orientation: "portrait", kind: "product", product: "户外风扇", steps: [
    { number: "01", file: "01.webp", title: "产品基底", note: "PRODUCT BASE" },
    { number: "02", file: "02.webp", title: "场景合成", note: "SCENE COMPOSITING" },
    { number: "03", file: "03.webp", title: "最终成片", note: "FINAL IMAGE" },
  ] },
];

const aurePalette = [
  { name: "NIGHT", hex: "#0D111B" },
  { name: "SLATE", hex: "#1D293A" },
  { name: "TEAL", hex: "#174B5B" },
  { name: "AMBER", hex: "#D7C891" },
];

const sswwPalette = [
  { name: "PORCELAIN", hex: "#F5F4F0" },
  { name: "SAND", hex: "#E8CFA2" },
  { name: "TERRACOTTA", hex: "#A9622A" },
  { name: "AQUA", hex: "#3977BF" },
];

function Arrow() { return <span className="arrow" aria-hidden="true">↗</span>; }

type ImageTiltSession = {
  element: HTMLElement;
  bounds: DOMRect;
  track: (event: PointerEvent) => void;
};

let activeImageTiltSession: ImageTiltSession | null = null;

function applyImageTilt(element: HTMLElement, clientX: number, clientY: number, bounds: DOMRect) {
  const horizontal = Math.max(-.5, Math.min(.5, (clientX - bounds.left) / bounds.width - .5));
  const vertical = Math.max(-.5, Math.min(.5, (clientY - bounds.top) / bounds.height - .5));
  element.classList.add("is-pointer-tilting");
  element.style.setProperty("--tilt-x", `${(-vertical * 8).toFixed(2)}deg`);
  element.style.setProperty("--tilt-y", `${(horizontal * 8).toFixed(2)}deg`);
  element.style.setProperty("--tilt-move-x", `${(horizontal * 10).toFixed(2)}px`);
  element.style.setProperty("--tilt-move-y", `${(vertical * 7).toFixed(2)}px`);
  element.style.setProperty("--tilt-shadow-x", `${(-horizontal * 18).toFixed(2)}px`);
  element.style.setProperty("--tilt-shadow-y", `${(22 - vertical * 10).toFixed(2)}px`);
}

function clearImageTilt(element: HTMLElement) {
  element.classList.remove("is-pointer-tilting");
  element.style.setProperty("--tilt-x", "0deg");
  element.style.setProperty("--tilt-y", "0deg");
  element.style.setProperty("--tilt-move-x", "0px");
  element.style.setProperty("--tilt-move-y", "0px");
  element.style.setProperty("--tilt-shadow-x", "0px");
  element.style.setProperty("--tilt-shadow-y", "22px");
}

function stopImageTilt(element?: HTMLElement) {
  const session = activeImageTiltSession;
  if (!session || (element && session.element !== element)) return;
  window.removeEventListener("pointermove", session.track);
  clearImageTilt(session.element);
  activeImageTiltSession = null;
}

function beginImageTilt<T extends HTMLElement>(event: ReactPointerEvent<T>) {
  if (event.pointerType === "touch") return;
  const element = event.currentTarget;
  if (activeImageTiltSession?.element === element) return;
  stopImageTilt();
  const bounds = element.getBoundingClientRect();
  const track = (pointer: PointerEvent) => {
    if (pointer.pointerType === "touch") return;
    const outside = pointer.clientX < bounds.left || pointer.clientX > bounds.right || pointer.clientY < bounds.top || pointer.clientY > bounds.bottom;
    if (outside) {
      stopImageTilt(element);
      return;
    }
    applyImageTilt(element, pointer.clientX, pointer.clientY, bounds);
  };
  activeImageTiltSession = { element, bounds, track };
  window.addEventListener("pointermove", track, { passive: true });
  applyImageTilt(element, event.clientX, event.clientY, bounds);
}

function updateImageTilt<T extends HTMLElement>(event: ReactPointerEvent<T>) {
  if (event.pointerType === "touch") return;
  if (activeImageTiltSession?.element !== event.currentTarget) {
    beginImageTilt(event);
    return;
  }
  applyImageTilt(event.currentTarget, event.clientX, event.clientY, activeImageTiltSession.bounds);
}

function resetImageTilt<T extends HTMLElement>(event: ReactPointerEvent<T>) {
  stopImageTilt(event.currentTarget);
}

function updateStickerTilt(element: HTMLElement, clientX: number, clientY: number) {
  const bounds = element.getBoundingClientRect();
  const horizontal = Math.max(-1, Math.min(1, (clientX - (bounds.left + bounds.width / 2)) / (window.innerWidth * .42)));
  const vertical = Math.max(-1, Math.min(1, (clientY - (bounds.top + bounds.height / 2)) / (window.innerHeight * .42)));
  element.classList.add("is-sticker-tilting");
  element.style.setProperty("--sticker-tilt-x", `${(-vertical * 10).toFixed(2)}deg`);
  element.style.setProperty("--sticker-tilt-y", `${(horizontal * 12).toFixed(2)}deg`);
  element.style.setProperty("--sticker-move-x", `${(horizontal * 10).toFixed(2)}px`);
  element.style.setProperty("--sticker-move-y", `${(vertical * 8).toFixed(2)}px`);
  element.style.setProperty("--sticker-shadow-x", `${(-horizontal * 24).toFixed(2)}px`);
  element.style.setProperty("--sticker-shadow-y", `${(14 - vertical * 13).toFixed(2)}px`);
  element.style.setProperty("--sticker-glint-x", `${(50 + horizontal * 40).toFixed(1)}%`);
  element.style.setProperty("--sticker-glint-y", `${(45 + vertical * 40).toFixed(1)}%`);
}

function resetStickerTilt(element: HTMLElement) {
  element.classList.remove("is-sticker-tilting");
  element.style.setProperty("--sticker-tilt-x", "0deg");
  element.style.setProperty("--sticker-tilt-y", "0deg");
  element.style.setProperty("--sticker-move-x", "0px");
  element.style.setProperty("--sticker-move-y", "0px");
  element.style.setProperty("--sticker-shadow-x", "0px");
  element.style.setProperty("--sticker-shadow-y", "12px");
  element.style.setProperty("--sticker-glint-x", "50%");
  element.style.setProperty("--sticker-glint-y", "42%");
}

type ProjectFact = { label: string; value: string };

function HeadingSpots() {
  return <svg className="heading-spots" viewBox="0 0 480 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path d="M9 54C18 30 51 17 84 21c31 4 51 21 47 39-5 21-37 25-66 31-31 6-67-7-56-37Z" />
    <path d="M123 116c8-22 37-34 68-32 35 3 60 19 58 38-3 22-36 31-72 29-34-2-62-14-54-35Z" />
    <path d="M262 38c12-24 46-33 80-27 38 6 61 26 54 45-8 22-46 24-80 19-35-5-65-15-54-37Z" />
    <path d="M343 117c8-22 36-37 67-36 35 1 63 16 62 35-2 23-36 35-70 35-35 0-67-13-59-34Z" />
  </svg>;
}

function ProjectOpening({ index, category, title, subtitle, summary, facts, image, variant, artworkClass = "", mirror = true }: { index: string; category: string; title: string; subtitle: string; summary: string; facts: ProjectFact[]; image: string; variant: "aure" | "ssww" | "crossborder" | "renders" | "aigc"; artworkClass?: string; mirror?: boolean }) {
  return <header className={`project-opening project-opening-${variant} reveal`}>
    <div className="project-opening-topline"><span>CASE {index} / 05</span><p>{category}</p><span>PORTFOLIO · 2026</span></div>
    <div className="project-opening-main">
      <div className="project-opening-copy">
        <HeadingSpots />
        <h2>{title}<br /><em>{subtitle}</em></h2>
        <p className="project-opening-summary">{summary}</p>
      </div>
      <div className={`project-opening-artwork ${artworkClass} ${mirror ? "" : "is-unmirrored"}`} aria-hidden="true"><ResponsiveImage src={image} alt="" /></div>
    </div>
    <dl className="project-opening-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
  </header>;
}

function Ticker() {
  return <div className="marquee" aria-hidden="true"><div className="marquee-track">{[0, 1, 2, 3].map((item) => <span key={item}>E-COMMERCE VISUALS <b>✦</b> 3D RENDERING <b>✦</b> IMAGE REFINEMENT <b>✦</b> AI-ASSISTED CREATION <b>✦</b></span>)}</div></div>;
}

type CarouselPosition = "left" | "center" | "right" | "hidden";

function DirectoryCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = catalogue.length;
  const move = (direction: number) => setActiveIndex((current) => (current + direction + total) % total);
  const positionFor = (index: number): CarouselPosition => {
    const offset = (index - activeIndex + total) % total;
    if (offset === 0) return "center";
    if (offset === 1) return "right";
    if (offset === total - 1) return "left";
    return "hidden";
  };

  return <div className="case-carousel reveal" aria-label="案例卡片轮播">
    <div className="case-carousel-stage" tabIndex={0} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }}>
      {catalogue.map((item, index) => {
        const position = positionFor(index);
        const isCenter = position === "center";
        return <a
          className={`carousel-card is-${position} ${item.className}`}
          href={item.href}
          key={item.id}
          tabIndex={position === "hidden" ? -1 : 0}
          aria-current={isCenter ? "true" : undefined}
          aria-hidden={position === "hidden" ? true : undefined}
          aria-label={`${item.id} ${item.title}${isCenter ? "，进入项目" : "，切换到此项目"}`}
          onPointerEnter={beginImageTilt}
          onPointerMove={updateImageTilt}
          onPointerCancel={resetImageTilt}
          onClick={(event) => {
            if (!isCenter) {
              event.preventDefault();
              setActiveIndex(index);
            }
          }}
        >
          <div className="tile-art"><ResponsiveImage src={item.image} alt="" /></div>
          <div className="carousel-card-top"><span><b>{item.id}</b> / CASE</span></div>
          <div className="tile-label"><h3>{item.title}</h3><p>{item.sub}</p><Arrow /></div>
        </a>;
      })}
    </div>
    <div className="case-carousel-controls">
      <button type="button" onClick={() => move(-1)} aria-label="上一个案例">←</button>
      <div className="case-carousel-status" aria-live="polite"><span>{String(activeIndex + 1).padStart(2, "0")}</span><i /><b>{String(total).padStart(2, "0")}</b><em>点击跳转</em></div>
      <button type="button" onClick={() => move(1)} aria-label="下一个案例">→</button>
    </div>
  </div>;
}

function ZoomImage({ src, alt, onOpen, className = "" }: { src: string; alt: string; onOpen: (src: string, alt: string) => void; className?: string }) {
  return <button
    className={`zoom-image reveal ${className}`}
    type="button"
    onPointerEnter={beginImageTilt}
    onPointerMove={updateImageTilt}
    onPointerCancel={resetImageTilt}
    onClick={() => onOpen(src, alt)}
    aria-label={`查看大图：${alt}`}
  ><div className="zoom-image-tilt-frame"><ResponsiveImage src={src} alt={alt} /><span>VIEW +</span></div></button>;
}

function Grid({ images, label, onOpen, className = "" }: { images: number[]; label: string; onOpen: (src: string, alt: string) => void; className?: string }) {
  return <div className={`image-grid ${className}`}>{images.map((number) => <ZoomImage key={number} src={asset(label, number)} alt={`${label} visual ${number}`} onOpen={onOpen} />)}</div>;
}

const wideRenders = new Set([8]);
const squareRenders = new Set([6, 7, 13, 14, 15, 16, 17, 33, 34, 35, 36, 37]);
const renderOrientation = (number: number) => wideRenders.has(number) ? "orientation-wide" : squareRenders.has(number) ? "orientation-square" : "orientation-tall";

function RenderGrid({ images, layout, onOpen }: { images: RenderItem[]; layout: string; onOpen: (src: string, alt: string) => void }) {
  const renderImage = (item: RenderItem) => {
    const source = typeof item === "number" ? asset("renders", item) : item.src;
    const alt = typeof item === "number" ? `render visual ${item}` : item.alt;
    const orientation = typeof item === "number" ? renderOrientation(item) : `orientation-${item.orientation}`;
    return <ZoomImage key={source} src={source} alt={alt} onOpen={onOpen} className={orientation} />;
  };

  if (layout === "home") {
    return <div className="render-mosaic layout-home home-bento-grid">{images.map(renderImage)}</div>;
  }

  return <div className={`render-mosaic layout-${layout}`}>{images.map(renderImage)}</div>;
}

function ProductSceneGrid({ images, onOpen }: { images: number[]; onOpen: (src: string, alt: string) => void }) {
  return <div className="ai-product-mosaic">{images.map((number) => <ZoomImage key={number} src={asset("aigc", number)} alt={`AI product scene ${number}`} onOpen={onOpen} className={number < 10 ? "orientation-wide" : "orientation-tall"} />)}</div>;
}

function AiImageProcess({ onOpen }: { onOpen: (src: string, alt: string) => void }) {
  const vehicleGroups = aiImageProcessGroups.filter((group) => group.kind === "vehicle");
  const productGroups = aiImageProcessGroups.filter((group) => group.kind !== "vehicle");
  const processItem = (group: (typeof aiImageProcessGroups)[number], step: (typeof aiImageProcessGroups)[number]["steps"][number], featured = false) => <article className={`ai-process-item is-${group.orientation} ${featured ? "ai-process-feature-item" : ""}`} key={`${group.folder}-${step.file}`}>
    <ZoomImage src={`/v2/aigc-process/${group.folder}/${step.file}`} alt={`${group.product} · ${step.title}`} onOpen={onOpen} className={`ai-process-image is-${group.orientation}`} />
    <div className="ai-process-meta"><span>{step.number}</span><div><h5>{step.title}</h5><p>{step.note}</p></div></div>
  </article>;

  return <section className="ai-process-board" aria-labelledby="ai-process-title">
    <div className="ai-process-head reveal">
      <div><span>AI IMAGE WORKFLOW · 09 STEPS</span><h4 id="ai-process-title">产品场景生成流程</h4></div>
      <p>从产品基底、场景构建到最终精修，以连续图像展示生成过程中的构图、融合与光影控制。</p>
    </div>
    <div className="ai-process-vehicle-row" aria-label="汽车场景生成流程">
      {vehicleGroups.map((group) => <section className="ai-process-vehicle-group" key={group.id}>
        <h5 className="ai-process-product-title"><span>{group.id}</span>{group.product}</h5>
        <div className="ai-process-feature-grid">{group.steps.map((step) => processItem(group, step, true))}</div>
      </section>)}
    </div>
    {productGroups.map((group) => <div className="ai-process-product ai-process-secondary-product" key={group.id}>
      <h5 className="ai-process-product-title"><span>{group.id}</span>{group.product}</h5>
      <div className="ai-process-grid">{group.steps.map((step) => processItem(group, step))}</div>
    </div>)}
  </section>;
}

function AureCaseIntro() {
  return <><ProjectOpening index="01" category="E-COMMERCE VISUAL SYSTEM" title="耳机详情视觉" subtitle="AURE Buds Pro" summary="为 TWS 耳机建立从产品功能到情绪场景的电商视觉系统，以沉浸降噪为叙事核心，统一主视觉、卖点图与产品精修。" image="/illustrations/sticker-aigc-office.png" variant="aure" artworkClass="is-sticker-artwork is-office-sticker" mirror={false} facts={[
    { label: "PROJECT / 项目类型", value: "耳机电商详情视觉" },
    { label: "ROLE / 个人职责", value: "视觉方向 · 3D 场景 · 后期精修" },
    { label: "OUTPUT / 交付内容", value: "主视觉 · 卖点图 · 详情页" },
    { label: "TOOLS / 工作方法", value: "C4D · Octane · PS · AI 辅助" },
  ]} /><div className="aure-case-intro reveal">
    <figure className="aure-hero-visual">
      <ResponsiveImage src={asset("aure", 1)} alt="佩戴 AURE Buds Pro 的人物置身超自然山野" />
      <figcaption><span>BRAND WORLD · 01</span><b>Listen beyond noise.</b></figcaption>
    </figure>
    <article className="aure-strategy-panel">
      <div className="strategy-textures" aria-hidden="true"><i className="strategy-cow-spots"><b /><b /><b /><b /></i><i className="strategy-ufo-beam" /></div>
      <div className="aure-title-block">
        <p>CREATIVE DIRECTION · 核心概念</p>
        <h2><span>让静谧</span><em>被看见</em></h2>
      </div>
      <section className="aure-context" aria-labelledby="aure-context-title">
        <div><span>01</span><h3 id="aure-context-title">设计背景</h3></div>
        <p>TWS 市场从参数竞争进入体验竞争。AURE 以高保真音质、主动降噪与 IPX7 防水切入中高端价位，视觉任务不只是展示功能，更要把“沉浸感”转译为可感知的品牌价值。</p>
      </section>
      <section className="aure-logic" aria-labelledby="aure-audience-title">
        <div className="aure-section-label"><span>02</span><h3 id="aure-audience-title">受众分析</h3></div>
        <div className="aure-insight-grid">
          <div><span>AUDIENCE / 核心受众</span><strong>23–45 岁通勤白领<br />与高频商务差旅人群</strong></div>
          <div><span>TENSION / 核心痛点</span><strong>隔绝环境干扰<br />获得稳定沉浸的聆听体验</strong></div>
        </div>
        <div className="aure-section-label aure-selling-label"><span>03</span><h3>卖点提炼</h3></div>
        <div className="aure-core"><span>EXPERIENCE CORE</span><strong>沉浸降噪 × 高保真聆听</strong></div>
        <ul className="aure-proof-points" aria-label="产品核心优势">
          <li><b>ANC</b><span>智能深度降噪</span></li>
          <li><b>COAXIAL</b><span>同轴双单元</span></li>
          <li><b>72H</b><span>长效续航</span></li>
          <li><b>360°</b><span>高解析环绕声</span></li>
        </ul>
      </section>
      <div className="aure-direction">
        <div className="aure-section-label aure-direction-label"><span>04</span><h3>视觉定调</h3></div>
        <div className="aure-direction-content">
          <strong>「静谧暗调 × 琥珀暖光」</strong>
          <p>以深蓝空间建立安静边界，用琥珀色能量光强调声学结构；超自然环境将功能利益升格为品牌体验，强化中高端质感。</p>
        </div>
      </div>
    </article>
  </div></>;
}

function AureDesignSystem() {
  return <section className="aure-brand-strip reveal" aria-label="AURE 色彩与产品设计系统">
    <div className="aure-palette-copy">
      <header><p>04 / COLOR SYSTEM</p><span>VISUAL LANGUAGE · AURE</span></header>
      <h3>沉静作为底色，<em>琥珀定义焦点。</em></h3>
      <div className="aure-swatches" aria-label="AURE 品牌色板">
        {aurePalette.map((color) => <div className="aure-swatch" key={color.hex}><i style={{ background: color.hex }} /><span>{color.name}</span><b>{color.hex}</b></div>)}
      </div>
      <p>以深海蓝建立静谧边界，琥珀暖光聚焦声学结构，银黑金属强化精密与高端感。核心画面以 C4D + Octane 搭建，并结合 AI 完成情绪环境延展。</p>
    </div>
    <figure className="aure-product-cutout">
      <ResponsiveImage src="/v2/aure/aure-product-cutout.png" alt="AURE Buds Pro 黑色金属耳机与充电盒产品图" />
      <figcaption><span>AURE BUDS PRO</span><b>Graphite finish · Product form</b></figcaption>
    </figure>
  </section>;
}

function SswwCaseIntro() {
  return <><ProjectOpening index="02" category="BATH PRODUCT VISUAL SYSTEM" title="卫浴详情视觉" subtitle="SSWW Bath" summary="围绕按摩浴缸与独立浴缸完成系列化视觉升级，把功能、材质与生活场景整理成连续、清晰的国内电商阅读节奏。" image="/illustrations/sticker-ssww-bath.png" variant="ssww" artworkClass="is-sticker-artwork is-ssww-sticker" mirror={false} facts={[
    { label: "PROJECT / 项目类型", value: "卫浴产品电商视觉" },
    { label: "ROLE / 个人职责", value: "视觉方向 · 场景渲染 · 页面编排" },
    { label: "OUTPUT / 交付内容", value: "主视觉 · 功能图 · 系列详情" },
    { label: "TOOLS / 工作方法", value: "C4D · Octane · PS · AI 辅助" },
  ]} /><div className="aure-case-intro ssww-case-intro reveal">
    <figure className="aure-hero-visual ssww-hero-visual">
      <ResponsiveImage src={asset("ssww", 1)} alt="SSWW 按摩浴缸与暖调浴室生活场景" />
      <figcaption><span>BRAND WORLD · 02</span><b>A warm ritual, made personal.</b></figcaption>
    </figure>
    <article className="aure-strategy-panel ssww-strategy-panel">
      <div className="strategy-textures" aria-hidden="true"><i className="strategy-cow-spots"><b /><b /><b /><b /></i><i className="strategy-ufo-beam" /></div>
      <div className="aure-title-block ssww-title-block">
        <p>CREATIVE DIRECTION · 核心概念</p>
        <h2><span>暖调轻奢</span><em>浴境</em></h2>
      </div>
      <section className="aure-context" aria-labelledby="ssww-context-title">
        <div><span>01</span><h3 id="ssww-context-title">设计背景</h3></div>
        <p>顺应居家卫浴体验升级趋势，项目围绕浴缸产品展开专项视觉升级：将按摩功能、空间氛围与使用体验转化为清晰卖点，兼顾品牌价值传递与电商转化效率。</p>
      </section>
      <section className="aure-logic" aria-labelledby="ssww-audience-title">
        <div className="aure-section-label"><span>02</span><h3 id="ssww-audience-title">受众分析</h3></div>
        <div className="aure-insight-grid">
          <div><span>AUDIENCE / 核心受众</span><strong>25–45 岁精致中产<br />关注品质与居家体验</strong></div>
          <div><span>TENSION / 核心痛点</span><strong>久坐腰酸、小户型局限<br />与枯燥单一的沐浴体验</strong></div>
        </div>
        <div className="aure-section-label aure-selling-label"><span>03</span><h3>卖点提炼</h3></div>
        <div className="aure-core"><span>EXPERIENCE CORE</span><strong>舒缓按摩 × 场景疗愈</strong></div>
        <ul className="aure-proof-points" aria-label="卫浴产品核心优势">
          <li><b>SURF SPA</b><span>冲浪按摩系统</span></li>
          <li><b>ERGONOMIC</b><span>工学靠背设计</span></li>
          <li><b>CUSTOM</b><span>多模式自定义</span></li>
          <li><b>IMMERSION</b><span>全景氛围体验</span></li>
        </ul>
      </section>
      <div className="aure-direction">
        <div className="aure-section-label aure-direction-label"><span>04</span><h3>视觉定调</h3></div>
        <div className="aure-direction-content">
          <strong>「暖调轻奢 × 意式极简」</strong>
          <p>以暖色空间和克制留白建立松弛感，通过人物互动、功能特写与场景代入，让舒适体验可视化，并提升品牌层级。</p>
        </div>
      </div>
    </article>
  </div></>;
}

function SswwDesignSystem() {
  return <section className="aure-brand-strip ssww-brand-strip reveal" aria-label="SSWW 色彩与产品设计系统">
    <div className="aure-palette-copy">
      <header><p>04 / COLOR SYSTEM</p><span>VISUAL LANGUAGE · SSWW</span></header>
      <h3>温润材质承载舒适，<em>品牌蓝锁定功能焦点。</em></h3>
      <div className="aure-swatches" aria-label="SSWW 品牌色板">
        {sswwPalette.map((color) => <div className="aure-swatch" key={color.hex}><i style={{ background: color.hex }} /><span>{color.name}</span><b>{color.hex}</b></div>)}
      </div>
      <p>场景以 C4D + Octane 搭建渲染，结合 PS 精修控制材质与光感；人物和环境通过 AI 辅助延展，使产品功能、空间体验与生活方式形成统一叙事。</p>
    </div>
    <figure className="aure-product-cutout ssww-product-cutout">
      <ResponsiveImage src="/v2/ssww/ssww-bath-cutout.png" alt="SSWW 白色按摩浴缸透明背景产品图" />
      <figcaption><span>SSWW MASSAGE BATH</span><b>Porcelain white · Product form</b></figcaption>
    </figure>
  </section>;
}

function CrossborderStrategyStrip() {
  return <section className="crossborder-strategy-strip reveal" aria-label="皮卡防滚架项目策略概览">
    <figure>
      <ResponsiveImage src="/v2/crossborder/truck-roll-bar/strategy-hero.jpg" alt="海岸公路场景中的皮卡防滚架" />
      <figcaption><span>BRAND WORLD · 03</span><b>Built for the journey.</b></figcaption>
    </figure>
    <div className="crossborder-strategy-copy">
      <header><span>CREATIVE DIRECTION · 核心概念</span><b>TRUCK ROLL BAR · EXPORT E-COMMERCE</b></header>
      <h3>稳固承载，<em>拓展远行。</em></h3>
      <div className="crossborder-strategy-grid">
        <article><span>01 / 设计背景</span><p>将防滚架的承重、耐候与多场景适配转化为清晰卖点。</p></article>
        <article><span>02 / 核心受众</span><p>皮卡改装、户外露营与长途载物用户。</p></article>
        <article><span>03 / 卖点提炼</span><p><strong>350 LBS</strong> 承重 · 防锈黑色涂层 · 灵活适配。</p></article>
        <article><span>04 / 视觉定调</span><p>户外越野场景 × 硬朗性能表达。</p></article>
      </div>
    </div>
  </section>;
}

function CrossborderGallery({ onOpen }: { onOpen: (src: string, alt: string) => void }) {
  const squareImages = [
    { file: "01.jpg", alt: "皮卡防滚架白底产品与装车主图" },
    { file: "02.jpg", alt: "皮卡防滚架耐腐蚀性能场景图" },
    { file: "04.jpg", alt: "皮卡防滚架承重与材质卖点图" },
    { file: "05.jpg", alt: "皮卡防滚架载物空间卖点图" },
    { file: "06.jpg", alt: "皮卡防滚架灯具安装卖点图" },
    { file: "07.jpg", alt: "皮卡防滚架车斗盖适配卖点图" },
  ];
  return <div className="crossborder-showcase">
    <div className="crossborder-square-grid">
      {squareImages.map((image) => <ZoomImage key={image.file} src={`/v2/crossborder/truck-roll-bar/${image.file}`} alt={image.alt} onOpen={onOpen} />)}
    </div>
    <ZoomImage className="crossborder-a-plus" src="/v2/crossborder/truck-roll-bar/a-plus.jpg" alt="皮卡防滚架 Amazon A+ 完整页面" onOpen={onOpen} />
  </div>;
}

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [modal, setModal] = useState<{ src: string; alt: string } | null>(null);
  const [modalZoom, setModalZoom] = useState(0);
  const [modalTall, setModalTall] = useState(false);
  const [modalRetry, setModalRetry] = useState(0);
  const [modalStatus, setModalStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [siteReady, setSiteReady] = useState(false);
  const [loadNotice, setLoadNotice] = useState("正在准备首屏预览");
  const open = (src: string, alt: string) => {
    setModalZoom(0);
    setModalTall(false);
    setModalRetry(0);
    setModalStatus("loading");
    setModal({ src, alt });
  };
  const moveTitleShine = (event: ReactPointerEvent<SVGSVGElement>) => {
    const title = event.currentTarget;
    const bounds = title.getBoundingClientRect();
    const viewBox = title.viewBox.baseVal;
    const x = viewBox.x + ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * viewBox.width;
    const y = viewBox.y + ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * viewBox.height;
    title.style.setProperty("--title-shine-x", `${x}px`);
    title.style.setProperty("--title-shine-y", `${y}px`);
    title.classList.add("is-shining");
  };
  const clearTitleShine = (event: ReactPointerEvent<SVGSVGElement>) => event.currentTarget.classList.remove("is-shining");

  useEffect(() => {
    let cancelled = false;
    let finishTimer = 0;
    let safetyTimer = 0;
    let gateOpened = false;
    const startedAt = Date.now();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const hashTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    const priorityRoot = hashTarget || document.getElementById("cases");
    const priorityPictures = Array.from(priorityRoot?.querySelectorAll<HTMLPictureElement>("picture") || []).slice(0, 5);
    const allPictures = Array.from(document.querySelectorAll<HTMLPictureElement>("picture"));
    const readPicture = (picture: HTMLPictureElement) => {
      const image = picture.querySelector<HTMLImageElement>("img");
      return image?.dataset.preloadSrc || "";
    };
    const posterSources = Array.from(document.querySelectorAll<HTMLVideoElement>("video[poster]")).map((video) => video.poster);
    const prioritySources = priorityPictures.map(readPicture).filter(Boolean);
    const allSources = [...allPictures.map(readPicture), ...posterSources].filter(Boolean);
    const uniqueSources = [...new Set(allSources)];
    const prioritySet = new Set(prioritySources);
    const sources = [...prioritySources, ...uniqueSources.filter((source) => !prioritySet.has(source))];
    const requiredLoaded = Math.max(1, Math.ceil(sources.length * 0.8));
    let completed = 0;
    let loaded = 0;
    let cursor = 0;

    const releaseSite = (notice: string) => {
      if (cancelled || gateOpened) return;
      gateOpened = true;
      setLoadNotice(notice);
      const minimumDisplay = Math.max(160, 520 - (Date.now() - startedAt));
      finishTimer = window.setTimeout(() => {
        if (cancelled) return;
        setSiteReady(true);
        root.style.overflow = previousOverflow;
      }, minimumDisplay);
    };

    const advance = (didLoad: boolean) => {
      completed += 1;
      if (didLoad) loaded += 1;
      if (cancelled) return;
      setLoadProgress(Math.round((loaded / Math.max(1, sources.length)) * 100));
      setLoadNotice(`已缓存 ${loaded} / ${sources.length} 张预览`);
      if (loaded >= requiredLoaded) releaseSite("80% 页面预览已缓存，正在进入");
      else if (completed >= sources.length) releaseSite("可用预览已完成缓存，未完成图片将在页面内重试");
    };
    const preload = (preview: string) => new Promise<boolean>((resolve) => {
      const candidates = [preview, retryAsset(preview, 1)];
      let candidateIndex = 0;
      const load = () => {
        const image = new Image();
        let settled = false;
        let timeout = 0;
        const settle = (loaded: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          if (!loaded && candidateIndex < candidates.length - 1) {
            candidateIndex += 1;
            window.setTimeout(load, 350);
            return;
          }
          resolve(loaded);
        };
        timeout = window.setTimeout(() => settle(false), 7000);
        image.onload = () => settle(true);
        image.onerror = () => settle(false);
        image.decoding = "async";
        image.src = candidates[candidateIndex];
        if (image.complete && image.naturalWidth > 0) settle(true);
      };
      load();
    });

    const worker = async () => {
      while (!cancelled && cursor < sources.length) {
        const source = sources[cursor];
        cursor += 1;
        advance(await preload(source));
      }
    };
    const workerCount = window.matchMedia("(max-width: 900px)").matches ? 3 : 6;
    setLoadNotice(`正在缓存 80% 的页面预览 · 共 ${sources.length} 张`);
    void Promise.all(Array.from({ length: workerCount }, worker));
    safetyTimer = window.setTimeout(() => releaseSite("网络较慢，剩余预览将在页面内继续加载"), 90000);

    return () => {
      cancelled = true;
      window.clearTimeout(finishTimer);
      window.clearTimeout(safetyTimer);
      root.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-active");
      observer.unobserve(entry.target);
    }), { threshold: 0.72 });
    document.querySelectorAll(".motion-step").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (event: PointerEvent) => cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    const stickers = () => document.querySelectorAll<HTMLElement>(".project-opening-artwork.is-sticker-artwork");
    const render = () => {
      stickers().forEach((sticker) => updateStickerTilt(sticker, pointerX, pointerY));
      frame = 0;
    };
    const track = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const reset = () => stickers().forEach(resetStickerTilt);
    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const silence = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
    };
    const resume = () => {
      silence();
      if (!document.hidden) void video.play().catch(() => undefined);
    };
    silence();
    resume();
    video.addEventListener("volumechange", silence);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    return () => {
      video.removeEventListener("volumechange", silence);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
    };
  }, []);

  return <>
    <div className={`site-loader ${siteReady ? "is-complete" : ""}`} role="status" aria-live="polite" aria-label={`作品集加载中 ${loadProgress}%`}>
      <div className="site-loader-panel">
        <div className="site-loader-meta"><span>YQ · PORTFOLIO</span><b>{String(loadProgress).padStart(2, "0")}%</b></div>
        <div className="site-loader-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadProgress}><i style={{ transform: `scaleX(${loadProgress / 100})` }} /></div>
        <p>LOADING PREVIEWS · {loadNotice}</p>
      </div>
    </div>
  <main className={siteReady ? "site-ready" : "site-preparing"} aria-busy={!siteReady}>
    <div ref={cursorRef} className="cursor-follower" aria-hidden="true" />
    <nav className="nav" aria-label="主导航"><a className="brand" href="#top">YQ<span>·</span></a><div className="nav-links"><a href="#cases">CASES</a><a href="#about">ABOUT</a><a href="#contact">CONTACT</a></div><span className="availability"><i /> PORTFOLIO 2026</span></nav>

    <header className="hero hero-editorial" id="top">
      <div className="hero-copy">
        <div className="hero-meta-line"><p className="eyebrow">YONG QI · VISUAL PORTFOLIO</p><span>01 / 2026</span></div>
        <div className="hero-title-group">
          <div className="hero-title-float">
            <svg className="hero-title-art" viewBox="45 275 1368 510" preserveAspectRatio="xMidYMid meet" role="img" aria-label="作品集 Portfolio" onPointerMove={moveTitleShine} onPointerEnter={moveTitleShine} onPointerLeave={clearTitleShine}>
              <title>作品集 Portfolio</title>
              <defs>
                <mask id="hero-title-alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="1448" height="1086" style={{ maskType: "alpha" }}>
                  <image href="/portfolio-title.png" x="0" y="0" width="1448" height="1086" />
                </mask>
                <radialGradient id="hero-title-highlight" gradientUnits="userSpaceOnUse" r="310">
                  <stop offset="0" stopColor="#fff" stopOpacity=".94" />
                  <stop offset=".34" stopColor="#f5ecce" stopOpacity=".48" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <image href="/portfolio-title.png" x="0" y="0" width="1448" height="1086" />
              <circle className="hero-title-shine" cx="var(--title-shine-x, 730px)" cy="var(--title-shine-y, 530px)" r="310" fill="url(#hero-title-highlight)" mask="url(#hero-title-alpha)" />
            </svg>
          </div>
          <p className="hero-edition">Selected Works <em>2026</em></p>
        </div>
        <div className="hero-bottom"><p>产品视觉 · 三维渲染 · AI 图像</p><a href="#cases" className="circle-link" aria-label="查看案例"><Arrow /></a></div>
      </div>
      <div className="hero-art reveal">
        <video ref={heroVideoRef} autoPlay loop muted playsInline preload="metadata" poster="/portfolio-ufo-cover.jpg" aria-label="UFO 光束吸起奶牛与斑马的动态封面">
          <source src="/portfolio-ufo-cover.mp4" type="video/mp4" />
        </video>
      </div>
    </header>
    <Ticker />

    <section className="directory" id="cases"><div className="directory-head reveal"><p className="eyebrow">内容索引 · INDEX</p><div className="hero-title-float inside-title-float"><svg className="hero-title-art inside-title-art" viewBox="29 282 1203 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="What's Inside?" onPointerMove={moveTitleShine} onPointerEnter={moveTitleShine} onPointerLeave={clearTitleShine}><title>What's Inside?</title><defs><mask id="inside-title-alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254" style={{ maskType: "alpha" }}><image href="/inside-title.png" x="0" y="0" width="1254" height="1254" /></mask><radialGradient id="inside-title-highlight" gradientUnits="userSpaceOnUse" r="270"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".34" stopColor="#f5ecce" stopOpacity=".42" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient></defs><image href="/inside-title.png" x="0" y="0" width="1254" height="1254" /><circle className="hero-title-shine" cx="var(--title-shine-x, 630px)" cy="var(--title-shine-y, 600px)" r="270" fill="url(#inside-title-highlight)" mask="url(#inside-title-alpha)" /></svg></div><ResponsiveImage className="directory-absurdity" src="/illustrations/cow-cursor.webp" alt="" ariaHidden /></div><DirectoryCarousel /></section>
    <Ticker />

    <section className="case-section aure-section" id="aure"><AureCaseIntro /><AureDesignSystem /><div className="detail-grid fade-grid aure-detail"><Grid images={[2, 3, 4]} label="aure" onOpen={open} /></div></section>
    <Ticker />

    <section className="case-section ssww-section" id="ssww"><SswwCaseIntro /><SswwDesignSystem /><div className="bath-series"><div className="group-label reveal"><span>01</span><div><h3>按摩浴缸</h3><p>Massage Bath</p></div></div><div className="detail-grid fade-grid bath-grid massage-detail"><Grid images={[2, 3, 4, 5]} label="ssww" onOpen={open} /></div></div><div className="bath-series"><div className="group-label reveal"><span>02</span><div><h3>独立浴缸</h3><p>Freestanding Bath</p></div></div><div className="detail-grid fade-grid bath-grid freestanding-detail"><Grid images={[7, 8, 9, 10]} label="ssww" onOpen={open} /></div></div></section>
    <Ticker />

    <section className="case-section crossborder-section" id="crossborder"><ProjectOpening index="03" category="TRUCK ROLL BAR VISUAL SYSTEM" title="皮卡防滚架视觉" subtitle="Truck Roll Bar" summary="围绕皮卡防滚架建立从主图、卖点图到 Amazon A+ 的完整跨境电商视觉，以 350 LBS 承重、防锈耐候、车型适配与载物拓展为核心，强化产品的硬朗性能与户外使用价值。" image="/illustrations/sticker-ssww-bath.png" variant="crossborder" artworkClass="is-sticker-artwork is-ssww-sticker" mirror={false} facts={[
      { label: "PROJECT / 项目类型", value: "皮卡防滚架跨境电商视觉" },
      { label: "ROLE / 个人职责", value: "视觉方向 · 卖点策划 · 场景合成" },
      { label: "OUTPUT / 交付内容", value: "主图 · 卖点图 · Amazon A+" },
      { label: "TOOLS / 工作方法", value: "C4D · Photoshop · AI 辅助" },
    ]} /><CrossborderStrategyStrip /><CrossborderGallery onOpen={open} /></section>
    <Ticker />

    <section className="case-section render-section" id="renders"><ProjectOpening index="04" category="3D PRODUCT VISUALIZATION" title="产品渲染" subtitle="Product Visuals" summary="跨随身配件、日化、五金、软体家具与卫浴的产品可视化选集，集中呈现建模、材质、灯光与商业画面控制能力。" image="/illustrations/sticker-product-knight.png" variant="renders" artworkClass="is-sticker-artwork is-product-sticker" mirror={false} facts={[
      { label: "PROJECT / 项目类型", value: "跨品类产品渲染选集" },
      { label: "ROLE / 个人职责", value: "建模 · 材质 · 灯光 · 后期" },
          { label: "OUTPUT / 内容规模", value: "4 个系列 · 24 幅作品" },
      { label: "TOOLS / 工作方法", value: "C4D · Octane · Photoshop" },
    ]} />{renderGroups.map((group) => <div className={`render-group ${group.model ? "model-group" : ""}`} key={group.index}><div className="group-label reveal"><span>{group.index}</span><div><h3>{group.sub}</h3><p>{group.title}</p></div></div><RenderGrid images={group.images} layout={group.layout} onOpen={open} /></div>)}</section>
    <Ticker />

    <section className="case-section aigc-section" id="aigc"><ProjectOpening index="05" category="IMAGE · AI" title="生成图像" subtitle="Image & AI" summary="将产品基底、场景生成与最终精修整理为一套完整流程，重点呈现产品融合、构图与光影控制的可控性。" image="/illustrations/sticker-aigc-office.png" variant="aigc" artworkClass="is-sticker-artwork is-office-sticker" mirror={false} facts={[
      { label: "PROJECT / 项目类型", value: "AI 产品场景视觉" },
      { label: "ROLE / 个人职责", value: "视觉设定 · 场景生成 · 合成 · 精修" },
      { label: "OUTPUT / 交付内容", value: "产品场景 · 生成流程" },
      { label: "PROCESS / 工作流程", value: "产品基底 · 场景生成 · 精修 · 后期" },
    ]} />{aiGroups.map((group) => <div className={`ai-group ai-group-${group.index} ai-group-${group.kind}`} key={group.index}><div className="group-label reveal"><span>{group.index}</span><div><h3>{group.title}</h3><p>{group.note}</p></div></div>{group.kind === "product" && <><AiImageProcess onOpen={open} /><ProductSceneGrid images={group.images} onOpen={open} /></>}</div>)}</section>

    <footer className="about-contact-section" id="about">
      <span className="contact-anchor" id="contact" aria-hidden="true" />
      <div className="about-contact-top"><p className="eyebrow">ABOUT · CONTACT</p><a href="#top">BACK TO TOP ↗</a></div>
      <div className="about-contact-main">
        <h2 className="about-contact-signature reveal">Better Call <span>Zhou</span></h2>
        <div className="about-contact-copy reveal"><p>专注产品视觉、电商详情与三维渲染，以完整图像叙事帮助产品建立更清晰的商业感知。</p><p>独立完成产品建模、渲染、后期精修与 AI 辅助图像创作。</p></div>
      </div>
      <div className="about-contact-bottom">
        <div><span>LET’S WORK TOGETHER</span><a className="about-contact-mail" href="mailto:894068734@qq.com">894068734@qq.com <Arrow /></a></div>
        <div className="about-contact-meta"><span>YONG QI · VISUAL DESIGNER</span><span>© 2026</span></div>
      </div>
    </footer>
    {modal && <div className={`lightbox is-${modalStatus} ${modalZoom ? `is-zoomed zoom-${modalZoom}` : ""} ${modalTall ? "is-long" : ""}`} role="dialog" aria-modal="true" aria-label={modal.alt} onClick={() => setModal(null)}><button type="button" onClick={() => setModal(null)} aria-label="关闭大图">×</button><div className="lightbox-status" role="status">{modalStatus === "error" ? "高清原图加载失败，请重新打开" : "正在加载高清原图…"}</div><img key={`${modal.src}-${modalRetry}`} src={modalRetry ? retryAsset(modal.src, modalRetry) : modal.src} alt={modal.alt} onLoad={(event) => { setModalStatus("loaded"); setModalTall(event.currentTarget.naturalHeight / event.currentTarget.naturalWidth > 2.2); }} onError={() => { if (modalRetry < 2) { setModalRetry((value) => value + 1); setModalStatus("loading"); } else setModalStatus("error"); }} onClick={(event) => { event.stopPropagation(); if (modalStatus === "loaded") setModalZoom((value) => value === 3 ? 0 : value + 1); }} /><span className="zoom-hint">{modalZoom === 0 ? "再次点击图片放大" : modalZoom === 3 ? "再次点击回到适屏" : `再次点击继续放大 · ${modalZoom}/3`}</span></div>}
  </main></>;
}
