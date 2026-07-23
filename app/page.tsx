"use client";

import { useEffect, useState } from "react";
import PointerField from "./pointer-field";
import SmoothScroll from "./smooth-scroll";

const nav = [
  ["首页", "intro"],
  ["经历", "beginning"],
  ["项目", "work"],
  ["能力", "capability"],
  ["联系", "contact"],
] as const;

const turns = [
  {
    no: "01",
    date: "2023",
    title: "第一次证明自己",
    text: "在团队指导下，我完成了负责项目的全部合同关键词目标，它们进入 Google Top 10。我也拿到了第一次绩效奖金。",
    note: "我开始明白：从零开始的人，要靠实际产出证明自己的价值。",
  },
  {
    no: "02",
    date: "观察",
    title: "不再只完成任务",
    text: "我开始反复查看公司里的 WordPress 和 Shopify 站点，补产品知识，也试着理解业务与网站系统是怎样连在一起的。",
    note: "工作不再只等于眼前的一张任务单。",
  },
  {
    no: "03",
    date: "发现",
    title: "开始主动找问题",
    text: "我发现一些早期建站遗留的问题，把它们整理成报告交给领导。问题被看见之后，我也得到更多真正动手改善它们的机会。",
    note: "从执行答案，走向提出问题。",
  },
  {
    no: "04",
    date: "责任",
    title: "承担完整结果",
    text: "两年里，我参与并推进了 5 个以上从 0 到 1 的品牌网站，职责逐渐延伸到内容、技术、结构、市场页面与长期维护。",
    note: "不是做完一个页面，而是让网站持续工作。",
  },
  {
    no: "05",
    date: "现在",
    title: "扩大能力边界",
    text: "我开始把 AI Agent、API、脚本与 IDE 放进自己的工作流，用它们处理重复劳动，也把时间留给判断、验证和新的问题。",
    note: "工具没有替我思考，只是让我能走得更远一点。",
  },
];

const projects = [
  {
    index: "01 / 04",
    name: "MOTAWILL",
    scope: "全站 SEO · 多市场 · 品牌增长",
    lead: "最初，我负责页面和内容。",
    story:
      "后来，我开始重新理解：一个品牌站点应该如何被搜索、被理解、被信任，并持续增长。",
    details: [
      "从 0 到 1 建立全站 SEO 结构",
      "尼日利亚、乌干达、伊朗、埃塞俄比亚等区域页面",
      "技术审计、WordPress 落地、内容与转化优化",
      "持续探索 GEO、AEO 与 AI 搜索可见性",
    ],
    className: "project--hero",
  },
  {
    index: "02 / 04",
    name: "TYCORUN",
    scope: "Shopify · 技术 SEO · 长期维护",
    lead: "长期维护，让我看到页面之外的系统。",
    story:
      "我学会的不只是优化一次页面，而是理解一个 Shopify 站点如何持续保持健康。",
    details: [
      "抓取、索引与技术架构",
      "结构化数据与产品页优化",
      "GSC、GA4 与 Core Web Vitals",
    ],
    className: "",
  },
  {
    index: "03 / 04",
    name: "JOEYOUNG",
    scope: "制造业 · 从 0 到 1 · 国际搜索",
    lead: "一次从品牌落地开始的制造业 SEO 实践。",
    story:
      "从太阳能逆变器产品与工业关键词出发，我参与技术审计、多语言内容和海外可见性的建立。",
    details: ["品牌站实施", "工业关键词规划", "多语言内容策略"],
    className: "",
  },
  {
    index: "04 / 04",
    name: "BENLG · SAMEBIKE · HUNTKEY",
    scope: "多品牌 · 不同业务模型",
    lead: "不同品牌，让我看到问题背后的共同结构。",
    story:
      "在独立站、电商与 B2B 项目之间反复交付，我逐渐学会迁移方法，而不是复制答案。",
    details: ["关键词矩阵", "内容系统", "跨品牌分析与 CRO"],
    className: "project--multi",
  },
];

const abilities = [
  {
    no: "01",
    title: "看见问题",
    text: "从抓取与索引、数据异常、页面体验和竞争结果里，先找到真正值得解决的地方。",
    tools: "Technical audit · GSC · GA4 · Ahrefs · Core Web Vitals",
  },
  {
    no: "02",
    title: "组织问题",
    text: "把散落的问题放进关键词、内容、信息结构与市场优先级中，形成可以执行的次序。",
    tools: "Keyword architecture · International SEO · GEO / AEO · Roadmap",
  },
  {
    no: "03",
    title: "解决问题",
    text: "让判断真正落到页面、代码、内容与站点维护里，并对上线后的表现继续负责。",
    tools: "WordPress · Shopify · Landing page · Schema · CRO",
  },
  {
    no: "04",
    title: "放大解决能力",
    text: "用 Agent、API 与脚本减少重复，把经验变成可以复用、检查和继续改进的工作流。",
    tools: "AI Agent · LLM API · Python · JavaScript · IDE workflow",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const sections = nav
      .map(([, id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".enter"));
    const heroElements = elements.filter((element) => element.closest(".hero"));
    const footerElements = elements.filter((element) => element.closest(".footer"));
    const observedElements = elements.filter(
      (element) => !element.closest(".hero") && !element.closest(".footer"),
    );

    if (reduceMotion.matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");
    let heroFrame = requestAnimationFrame(() => {
      heroFrame = requestAnimationFrame(() => {
        heroElements.forEach((element) => element.classList.add("is-visible"));
      });
    });

    const contentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          contentObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -24%", threshold: 0 },
    );

    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          footerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0 },
    );

    observedElements.forEach((element) => contentObserver.observe(element));
    footerElements.forEach((element) => footerObserver.observe(element));

    return () => {
      cancelAnimationFrame(heroFrame);
      contentObserver.disconnect();
      footerObserver.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <SmoothScroll paused={menuOpen} />
      <PointerField />
      <a className="skip-link" href="#content">跳到主要内容</a>
      <header className="site-header">
        <a className="brand" href="#intro" aria-label="Lou 首页">
          <span>LOU</span><i>/</i><small>2026</small>
        </a>
        <button
          className={menuOpen ? "menu-button is-open" : "menu-button"}
          type="button"
          aria-label={menuOpen ? "关闭目录" : "打开目录"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-labels" aria-hidden="true">
            <span>目录</span>
            <span>关闭</span>
          </span>
          <span className="menu-mark" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="primary-nav" className={menuOpen ? "nav is-open" : "nav"} aria-label="主要导航">
          {nav.map(([label, id], index) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <small>0{index}</small>{label}
            </a>
          ))}
        </nav>
      </header>

      <main id="content">
        <section className="hero chapter" id="intro" aria-labelledby="hero-title">
          <span className="field-note" aria-hidden="true">OBSERVATION / 00 <i /> 12 · 24 · 36</span>
          <p className="chapter-label enter enter--1">00 / INTRO</p>
          <div className="hero-title-wrap enter enter--2">
            <h1 id="hero-title"><span>你好，</span><br /><span className="hero-name">我是 <em>Lou</em>。</span></h1>
          </div>
          <div className="hero-copy enter enter--3">
            <p className="hero-lead">我并不是一开始就知道<br />自己会做 SEO。</p>
            <p>但进入这个领域之后，<br />我开始认真对待每一个问题。</p>
            <small>SEO PRACTICE · 2023—NOW</small>
          </div>
          <a className="continue-link enter enter--4" href="#beginning">继续向下阅读 <span aria-hidden="true">↓</span></a>
          <p className="hero-note enter enter--5">在探索中，逐渐找到方向。</p>
          <span className="folio" aria-hidden="true">01</span>
        </section>

        <section className="beginning chapter" id="beginning" aria-labelledby="beginning-title">
          <span className="field-note" aria-hidden="true">FIELD NOTE / 01 <i /> MOVING</span>
          <header className="section-head">
            <p className="chapter-label enter enter--1">01 / 起点</p>
            <h2 className="enter enter--2" id="beginning-title">方向并不是<br />一开始就有的。</h2>
          </header>
          <div className="beginning-copy">
            <p className="date enter enter--2">2023</p>
            <p className="large-copy enter enter--3">我原本在学习阿里国际站运营。后来因为公司人员变化，被安排去接触独立站 SEO。</p>
            <p className="enter enter--4">不是一个预先规划好的选择，更像是被推上了路。起初，我只是支持托管项目；但第一次完整交付之后，我开始认真想：下一次能不能做得更好一点。</p>
          </div>
          <aside className="margin-note">UNCERTAIN<br />BUT MOVING</aside>
        </section>

        <section className="turning chapter" aria-labelledby="turning-title">
          <header className="section-head section-head--wide">
            <p className="chapter-label enter enter--1">02 / 转折</p>
            <h2 className="enter enter--2" id="turning-title">一些安静发生的变化，<br />让工作不再只是完成任务。</h2>
          </header>
          <div className="turn-list">
            {turns.map((turn) => (
              <article className="turn enter" key={turn.no}>
                <p className="turn-no">{turn.no}</p>
                <p className="turn-date">{turn.date}</p>
                <h3>{turn.title}</h3>
                <p>{turn.text}</p>
                <blockquote>{turn.note}</blockquote>
              </article>
            ))}
          </div>
        </section>

        <section className="work chapter" id="work" aria-labelledby="work-title">
          <header className="section-head section-head--wide">
            <p className="chapter-label enter enter--1">03 / 项目</p>
            <h2 className="enter enter--2" id="work-title">能力不是列出来的。<br />它留在做过的事情里。</h2>
          </header>
          <div className="project-list">
            {projects.map((project) => (
              <article className={`project enter ${project.className}`} key={project.name}>
                <header>
                  <p>{project.index}</p>
                  <p>{project.scope}</p>
                </header>
                <h3>{project.name}</h3>
                <div className="project-story">
                  <p className="project-lead">{project.lead}</p>
                  <p>{project.story}</p>
                </div>
                <ul>
                  {project.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="capability chapter" id="capability" aria-labelledby="capability-title">
          <span className="field-note" aria-hidden="true">SIGNAL MAP / 04 <i /> 04 POINTS</span>
          <header className="section-head section-head--wide">
            <p className="chapter-label enter enter--1">04 / 能力</p>
            <h2 className="enter enter--2" id="capability-title">这些能力，来自<br />一次次实际问题。</h2>
          </header>
          <p className="capability-intro enter enter--3">我正在建立的，不是一张越来越长的工具清单，而是一种更完整地处理问题的方式。</p>
          <ol className="ability-list">
            {abilities.map((ability) => (
              <li className="enter" key={ability.no}>
                <span className="ability-no">{ability.no}</span>
                <h3>{ability.title}</h3>
                <p>{ability.text}</p>
                <small>{ability.tools}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className="contact chapter" id="contact" aria-labelledby="contact-title">
          <span className="field-note" aria-hidden="true">OPEN CHANNEL / 05 <i /> CONTINUE</span>
          <p className="chapter-label enter enter--1">05 / 继续</p>
          <div className="contact-main">
            <h2 className="enter enter--2" id="contact-title">我还在继续。</h2>
            <p className="enter enter--3">我知道自己的经验仍然有限。</p>
            <p className="enter enter--4">所以我持续观察、持续学习，也持续把新的理解放进真实项目里验证。</p>
            <p className="enter enter--5">我希望下一段经历，仍然能让我承担更多，也让我看见更多。</p>
          </div>
          <div className="contact-action enter enter--6">
            <p>如果你愿意，我们可以聊聊新的可能。</p>
            <div className="contact-links">
              <a className="email-link" href="mailto:914394053@qq.com">914394053@qq.com <span aria-hidden="true">↗</span></a>
              <div className="social-links" aria-label="社交链接">
                <a href="https://github.com/slimeonnnna" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
                <a href="https://www.linkedin.com/in/amynos-l" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer enter">
        <p>© 2026 LOU</p>
        <div className="footer-social">
          <a href="https://github.com/slimeonnnna" target="_blank" rel="noreferrer">GITHUB ↗</a>
          <a href="https://www.linkedin.com/in/amynos-l" target="_blank" rel="noreferrer">LINKEDIN ↗</a>
        </div>
        <a href="#intro">回到顶部 ↑</a>
      </footer>
    </>
  );
}
