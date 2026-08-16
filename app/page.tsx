"use client";

import { useEffect, useRef, useState } from "react";

const asset = (folder: string, number: number) => `/v2/${folder}/${String(number).padStart(2, "0")}.webp`;

const catalogue = [
  { href: "#aure", id: "01", title: "耳机视觉", sub: "AURE BUDS PRO", image: asset("aure", 1), className: "case-aure" },
  { href: "#ssww", id: "02", title: "卫浴视觉", sub: "SSWW BATH", image: asset("ssww", 1), className: "case-ssww" },
  { href: "#renders", id: "03", title: "产品渲染", sub: "PRODUCT RENDERS", image: asset("renders", 2), className: "case-renders" },
  { href: "#aigc", id: "04", title: "AI视觉设计", sub: "IMAGE · MOTION · AI", image: asset("aigc", 7), className: "case-aigc" },
];

const renderGroups = [
  { index: "01", title: "MOBILE ACCESSORIES", sub: "随身配件", images: [3, 4, 5], layout: "trio" },
  { index: "02", title: "HARDWARE RENDERS", sub: "五金渲染", images: [9, 10, 11, 13, 14, 16, 17], layout: "hardware" },
  { index: "03", title: "SOFT FURNITURE", sub: "软体家具", images: [18, 19, 20, 21, 22, 23], layout: "feature" },
  { index: "04", title: "BATH COLLECTION", sub: "卫浴造型", images: [24, 25, 27, 28, 29, 30], layout: "feature" },
  { index: "05", title: "CONCEPT SCENE", sub: "概念场景", images: [1, 2, 6, 7, 8], layout: "concept" },
  { index: "06", title: "WHITE MODEL STUDY", sub: "白模与建模研究", images: [32, 33, 34, 35, 36, 37], layout: "feature", model: true },
];

const aiGroups = [
  { index: "01", title: "活动视觉", note: "Campaign Posters & Layout Studies", images: [1, 2] },
  { index: "02", title: "沙发产品 AI 短片", note: "Green Lounge · AI Product Film", images: [3, 4, 5, 6] },
  { index: "03", title: "产品场景生成", note: "AI Product Scenes · Beauty & Beverage", images: [8, 9, 10, 11, 12, 13, 14, 15] },
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
          onClick={(event) => {
            if (!isCenter) {
              event.preventDefault();
              setActiveIndex(index);
            }
          }}
        >
          <div className="tile-art"><img src={item.image} alt="" /></div>
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
  return <button className={`zoom-image reveal ${className}`} type="button" onClick={() => onOpen(src, alt)} aria-label={`查看大图：${alt}`}><img src={src} alt={alt} loading="lazy" /><span>VIEW +</span></button>;
}

function Grid({ images, label, onOpen, className = "" }: { images: number[]; label: string; onOpen: (src: string, alt: string) => void; className?: string }) {
  return <div className={`image-grid ${className}`}>{images.map((number) => <ZoomImage key={number} src={asset(label, number)} alt={`${label} visual ${number}`} onOpen={onOpen} />)}</div>;
}

const wideRenders = new Set([2, 8]);
const squareRenders = new Set([6, 7, 13, 14, 15, 16, 17, 33, 34, 35, 36, 37]);
const renderOrientation = (number: number) => wideRenders.has(number) ? "orientation-wide" : squareRenders.has(number) ? "orientation-square" : "orientation-tall";

function RenderGrid({ images, layout, onOpen }: { images: number[]; layout: string; onOpen: (src: string, alt: string) => void }) {
  return <div className={`render-mosaic layout-${layout}`}>{images.map((number) => <ZoomImage key={number} src={asset("renders", number)} alt={`render visual ${number}`} onOpen={onOpen} className={renderOrientation(number)} />)}</div>;
}

function ProductSceneGrid({ images, onOpen }: { images: number[]; onOpen: (src: string, alt: string) => void }) {
  return <div className="ai-product-mosaic">{images.map((number) => <ZoomImage key={number} src={asset("aigc", number)} alt={`AI product scene ${number}`} onOpen={onOpen} className={number < 10 ? "orientation-wide" : "orientation-tall"} />)}</div>;
}

const sofaPhases = [
  { image: 3, phase: "Phase 01", title: "3D 场景搭建" },
  { image: 4, phase: "Phase 02", title: "AI 脚本生成" },
  { image: 5, phase: "Phase 03", title: "生成分镜内容" },
  { image: 6, phase: "Phase 04", title: "后期剪辑调整" },
];

function SofaWorkflow({ onOpen }: { onOpen: (src: string, alt: string) => void }) {
  return <div className="sofa-workflow">{sofaPhases.map((item) => <article className="workflow-card reveal" key={item.image}><div className="workflow-label"><span>{item.phase}</span><h4>{item.title}</h4></div><ZoomImage src={asset("aigc", item.image)} alt={`${item.phase} ${item.title}`} onOpen={onOpen} /></article>)}</div>;
}

function AureCaseIntro() {
  return <div className="aure-case-intro reveal">
    <figure className="aure-hero-visual">
      <img src={asset("aure", 1)} alt="佩戴 AURE Buds Pro 的人物置身超自然山野" />
      <figcaption><span>BRAND WORLD · 01</span><b>Listen beyond noise.</b></figcaption>
    </figure>
    <article className="aure-strategy-panel">
      <header className="aure-strategy-head"><p>CASE 01 · AURE</p><span>E-COMMERCE VISUAL SYSTEM / 2026</span></header>
      <div className="aure-title-block">
        <p>耳机产品视觉系统</p>
        <h2><span>让静谧</span><em>被看见</em></h2>
        <strong>AURE Buds Pro</strong>
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
  </div>;
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
      <img src="/v2/aure/aure-product-cutout.png" alt="AURE Buds Pro 黑色金属耳机与充电盒产品图" />
      <figcaption><span>AURE BUDS PRO</span><b>Graphite finish · Product form</b></figcaption>
    </figure>
  </section>;
}

function SswwCaseIntro() {
  return <div className="aure-case-intro ssww-case-intro reveal">
    <figure className="aure-hero-visual ssww-hero-visual">
      <img src={asset("ssww", 1)} alt="SSWW 按摩浴缸与暖调浴室生活场景" />
      <figcaption><span>BRAND WORLD · 02</span><b>A warm ritual, made personal.</b></figcaption>
    </figure>
    <article className="aure-strategy-panel ssww-strategy-panel">
      <header className="aure-strategy-head"><p>CASE 02 · SSWW</p><span>E-COMMERCE VISUAL SYSTEM / 2026</span></header>
      <div className="aure-title-block ssww-title-block">
        <p>卫浴产品视觉系统</p>
        <h2><span>暖调轻奢</span><em>浴境</em></h2>
        <strong>SSWW Massage Bath</strong>
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
  </div>;
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
      <img src="/v2/ssww/ssww-bath-cutout.png" alt="SSWW 白色按摩浴缸透明背景产品图" />
      <figcaption><span>SSWW MASSAGE BATH</span><b>Porcelain white · Product form</b></figcaption>
    </figure>
  </section>;
}

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<{ src: string; alt: string } | null>(null);
  const [modalZoom, setModalZoom] = useState(0);
  const [modalTall, setModalTall] = useState(false);
  const open = (src: string, alt: string) => { setModalZoom(0); setModalTall(false); setModal({ src, alt }); };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting)), { threshold: 0.72 });
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
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return <main>
    <div ref={cursorRef} className="cursor-follower" aria-hidden="true" />
    <nav className="nav" aria-label="主导航"><a className="brand" href="#top">YQ<span>·</span></a><div className="nav-links"><a href="#cases">CASES</a><a href="#about">ABOUT</a><a href="#contact">CONTACT</a></div><span className="availability"><i /> PORTFOLIO 2026</span></nav>

    <header className="hero hero-editorial" id="top">
      <div className="hero-copy">
        <div className="hero-meta-line"><p className="eyebrow">YONG QI · VISUAL PORTFOLIO</p><span>01 / 2026</span></div>
        <div className="hero-title-group"><p className="hero-cn-accent">2026作品集</p><h1><span>PORT</span><span>FOLIO</span></h1><p className="hero-edition">Selected Works <em>2026</em></p></div>
        <div className="hero-bottom"><p>产品视觉 · 三维渲染 · AI 图像</p><a href="#cases" className="circle-link" aria-label="查看案例"><Arrow /></a></div>
      </div>
      <div className="hero-art reveal">
        <video autoPlay loop muted playsInline preload="auto" poster="/portfolio-ufo-cover.png" aria-label="UFO 光束吸起奶牛与斑马的动态封面">
          <source src="/portfolio-ufo-cover.mp4" type="video/mp4" />
        </video>
      </div>
    </header>
    <Ticker />

    <section className="directory" id="cases"><div className="directory-head reveal"><p className="eyebrow">内容索引 · INDEX</p><h2 className="inside-title">What’s<br /><em>Inside?</em></h2></div><DirectoryCarousel /></section>
    <Ticker />

    <section className="case-section aure-section" id="aure"><AureCaseIntro /><AureDesignSystem /><div className="detail-grid fade-grid aure-detail"><Grid images={[2, 3, 4]} label="aure" onOpen={open} /></div></section>
    <Ticker />

    <section className="case-section ssww-section" id="ssww"><SswwCaseIntro /><SswwDesignSystem /><div className="bath-series"><div className="group-label reveal"><span>01</span><div><h3>按摩浴缸</h3><p>Massage Bath</p></div></div><div className="detail-grid fade-grid bath-grid massage-detail"><Grid images={[2, 3, 4, 5]} label="ssww" onOpen={open} /></div></div><div className="bath-series"><div className="group-label reveal"><span>02</span><div><h3>独立浴缸</h3><p>Freestanding Bath</p></div></div><div className="detail-grid fade-grid bath-grid freestanding-detail"><Grid images={[7, 8, 9, 10]} label="ssww" onOpen={open} /></div></div></section>
    <Ticker />

    <section className="case-section render-section" id="renders"><div className="gallery-title reveal"><p className="eyebrow">案例 03</p><h2>产品渲染<br /><em>Product Visuals</em></h2><p>按单一产品划分画面，用统一行高和清晰节奏呈现不同角度。</p></div>{renderGroups.map((group) => <div className={`render-group ${group.model ? "model-group" : ""}`} key={group.index}><div className="group-label reveal"><span>{group.index}</span><div><h3>{group.sub}</h3><p>{group.title}</p></div></div><RenderGrid images={group.images} layout={group.layout} onOpen={open} /></div>)}</section>
    <Ticker />

    <section className="case-section aigc-section" id="aigc"><div className="split-intro reveal"><img src={asset("aigc", 7)} alt="Green Lounge AI 动态视觉" /><div className="intro-copy ai-copy"><p className="eyebrow">案例 04</p><h2>生成图像</h2><em>Image, Motion & AI</em><p>将生成图像、人物整合、分镜与动态图像分组为可阅读的商业视觉实验。</p></div></div>{aiGroups.map((group) => <div className={`ai-group ai-group-${group.index}`} key={group.index}><div className="group-label reveal"><span>{group.index}</span><div><h3>{group.title}</h3><p>{group.note}</p></div></div>{group.index === "02" && <><div className="motion-film reveal"><video controls playsInline preload="metadata" poster={asset("aigc", 7)}><source src="/v2/aigc/green-lounge-silent.mp4" type="video/mp4" /></video><div className="motion-copy"><p className="eyebrow">AI PRODUCT FILM · PROCESS</p><h4>智能单人沙发<br />AI 动态短片流程探索</h4><ul><li className="motion-step"><b>3D 场景搭建</b><span>完成风格化家居空间渲染，建立高质量静帧基调。</span></li><li className="motion-step"><b>AI 脚本生成</b><span>分析产品功能卖点与空间氛围，规划分镜脚本。</span></li><li className="motion-step"><b>生成分镜设定</b><span>围绕阅读、人与宠物互动等情境生成关键画面。</span></li><li className="motion-step"><b>后期剪辑调整</b><span>完成生视频、节奏剪辑、调色与转场节点。</span></li></ul></div></div><SofaWorkflow onOpen={open} /></>}{group.index === "03" ? <ProductSceneGrid images={group.images} onOpen={open} /> : group.index !== "02" && <Grid images={group.images} label="aigc" onOpen={open} />}</div>)}</section>

    <footer className="about-contact-section" id="about">
      <span className="contact-anchor" id="contact" aria-hidden="true" />
      <div className="about-contact-top"><p className="eyebrow">ABOUT · CONTACT</p><a href="#top">BACK TO TOP ↗</a></div>
      <div className="about-contact-main">
        <h2 className="reveal">YONG QI,<br /><em>Portfolio 2026.</em></h2>
        <div className="about-contact-copy reveal"><p>专注产品视觉、电商详情与三维渲染，以完整图像叙事帮助产品建立更清晰的商业感知。</p><p>独立完成产品建模、渲染、后期精修与 AI 辅助图像创作。</p></div>
      </div>
      <div className="about-contact-bottom">
        <div><span>LET’S WORK TOGETHER</span><a className="about-contact-mail" href="mailto:894068734@qq.com">894068734@qq.com <Arrow /></a></div>
        <div className="about-contact-meta"><span>YONG QI · VISUAL DESIGNER</span><span>© 2026</span></div>
      </div>
    </footer>
    {modal && <div className={`lightbox ${modalZoom ? `is-zoomed zoom-${modalZoom}` : ""} ${modalTall ? "is-long" : ""}`} role="dialog" aria-modal="true" aria-label={modal.alt} onClick={() => setModal(null)}><button type="button" onClick={() => setModal(null)} aria-label="关闭大图">×</button><img src={modal.src} alt={modal.alt} onLoad={(event) => setModalTall(event.currentTarget.naturalHeight / event.currentTarget.naturalWidth > 2.2)} onClick={(event) => { event.stopPropagation(); setModalZoom((value) => value === 3 ? 0 : value + 1); }} /><span className="zoom-hint">{modalZoom === 0 ? "再次点击图片放大" : modalZoom === 3 ? "再次点击回到适屏" : `再次点击继续放大 · ${modalZoom}/3`}</span></div>}
  </main>;
}
