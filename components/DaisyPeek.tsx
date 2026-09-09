'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * DaisyPeek — 从地平线探出头、眼神跟随鼠标、点击眨眼的 daisy。
 *
 * 数据来自 Figma 的四张注视图（Group 5 / 7 / 8 / 9）：
 *   八条眼白路径归一化成 12 个点（4 锚点 + 8 控制柄），运行时按注视方向双线性插值；
 *   眼白和 clipPath 共用同一份 d，所以遮罩永远贴合当前轮廓；
 *   眼睑是一个大半径的圆，落下时露出的下边缘是一段弧；
 *   瞳孔上翻幅度直接读眼睑的实时 translateY，两者永远同步。
 *
 * 用法：把它贴在两个 section 的交界处，父容器的下边缘就是地平线。
 *   <DaisyPeek width={200} peek={0.72} />
 */

type Quadrant = 'UL' | 'UR' | 'DL' | 'DR';

/* 顺序: P右, c1, c2, P下, c3, c4, P左, c5, c6, P上, c7, c8  —— 相对眼白中心 */
const SHAPE: Record<'L' | 'R', Record<Quadrant, number[]>> = {
  L: {
    UL: [23.5, 0, 23.5, 13.255, 12.979, 24, 0, 24, -12.979, 24, -23.5, 13.255, -23.5, 0, -23.5, -13.255, -12.979, -24, 0, -24, 12.979, -24, 23.5, -13.255],
    UR: [24.5, 3.041, 24.5, 17.699, 13.531, 23.5, 0, 23.5, -13.531, 23.5, -24.5, 17.699, -24.5, 3.041, -24.5, -11.617, -13.531, -23.5, 0, -23.5, 13.531, -23.5, 24.5, -11.617],
    DL: [26.5, 3.036, 26.5, 17.672, 14.635, 23.463, 0, 23.463, -14.636, 23.463, -26.5, 17.672, -26.5, 3.036, -26.5, -11.599, -14.636, -23.464, 0, -23.464, 14.635, -23.464, 26.5, -11.599],
    DR: [26.5, 4, 26.5, 18.635, 14.636, 22.5, 0, 22.5, -14.635, 22.5, -26.5, 18.635, -26.5, 4, -26.5, -10.636, -14.635, -22.5, 0, -22.5, 14.636, -22.5, 26.5, -10.636],
  },
  R: {
    UL: [24.5, 0, 24.5, 13.531, 13.531, 24.5, 0, 24.5, -13.531, 24.5, -24.5, 13.531, -24.5, 0, -24.5, -13.531, -13.531, -24.5, 0, -24.5, 13.531, -24.5, 24.5, -13.531],
    UR: [24, 2.54, 24, 17.198, 13.255, 24, 0, 24, -13.255, 24, -24, 17.198, -24, 2.54, -24, -12.118, -13.255, -24, 0, -24, 13.255, -24, 24, -12.118],
    DL: [26.5, 2.536, 26.5, 17.172, 14.635, 23.963, 0, 23.963, -14.636, 23.963, -26.5, 17.172, -26.5, 2.536, -26.5, -12.099, -14.636, -23.964, 0, -23.964, 14.635, -23.964, 26.5, -12.099],
    DR: [26.5, 4.5, 26.5, 19.136, 14.636, 22, 0, 22, -14.636, 22, -26.5, 19.136, -26.5, 4.5, -26.5, -10.135, -14.636, -22, 0, -22, 14.636, -22, 26.5, -10.135],
  },
};

/** 你画的瞳孔半径，跟着形状一起插值 */
const PUPIL_R: Record<'L' | 'R', Record<Quadrant, number>> = {
  L: { UL: 15.25, UR: 15.5, DL: 15.5, DR: 16.5 },
  R: { UL: 15.567, UR: 15.5, DL: 15.5, DR: 16.5 },
};

const REST_DIR: Record<Quadrant, [number, number]> = {
  UL: [-0.71, -0.71],
  UR: [0.71, -0.71],
  DL: [-0.79, 0.61],
  DR: [0.76, 0.65],
};

export const VB_W = 334;
export const VB_H = 315;
const HALF_H = 25; // 眼白最大半高 + 余量
const HALF_W = 27; // 眼白最大半宽 + 余量

const EYES = [
  { k: 'L' as const, cx: 124.717, cy: 134 },
  { k: 'R' as const, cx: 199.5, cy: 136.5 },
];

export const BODY_D =
  'M152.711 0C177.621 0 189.711 9.00001 199.711 19C210.409 29.6979 213.711 36 213.711 75C234.211 53.5 255.211 47 281.211 47C298.711 47 316.211 56.5288 324.211 66.4612C349.211 97.5 323.681 157.992 276.968 168.931C267.525 171.143 262.016 172.412 252.325 173.537C272.711 184.5 293.211 197.5 306.765 216C345.461 268.817 249.298 329.557 190.298 311C162.298 302.194 126.463 254.269 127.389 225.872C114.974 241.477 96.355 248.739 77.7106 257C55.1764 263.349 31.7979 264.89 21.7979 257C9.54171 247.33 4.8794 236.784 6.71064 222.5C9.21064 203 11.7106 196 20.2106 184.5C29.9359 171.342 42.7106 160.5 53.7106 153.5C42.7106 145.5 30.0735 135.577 21.7979 128.706C10.7106 119.5 -9.24357 81.2057 4.87028 60.6358C11.4783 51.005 22.8843 45.297 34.452 43.4358C58.9528 39.4928 76.2789 52.7874 94.9579 66.4612C98.7106 43.4358 101.433 27.1312 109.211 19C122.211 5.40909 127.389 0 152.711 0Z';

const MOUTH_D = 'M156.711 184.869C159.079 188.292 163.07 190.46 175.07 182.961';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpArr = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function toPath(p: number[], cx: number, cy: number) {
  const X = (i: number) => (cx + p[i]).toFixed(2);
  const Y = (i: number) => (cy + p[i]).toFixed(2);
  return (
    `M${X(0)} ${Y(1)}C${X(2)} ${Y(3)} ${X(4)} ${Y(5)} ${X(6)} ${Y(7)}` +
    `C${X(8)} ${Y(9)} ${X(10)} ${Y(11)} ${X(12)} ${Y(13)}` +
    `C${X(14)} ${Y(15)} ${X(16)} ${Y(17)} ${X(18)} ${Y(19)}` +
    `C${X(20)} ${Y(21)} ${X(22)} ${Y(23)} ${X(0)} ${Y(1)}Z`
  );
}

export type DaisyPeekProps = {
  /** 花的渲染宽度。数字按 px，字符串按 CSS 长度（内联用 em 跟着字号走，如 '1.15em'）。 */
  width?: number | string;
  /** 内联进一行文字里。会用 inline-flex 并按基线对齐。 */
  inline?: boolean;
  /** 基线对齐微调，仅 inline 时生效。 */
  verticalAlign?: string;
  /** 从地平线（父容器下边缘）钻出来的入场，进入视口时播放一次。 */
  rise?: boolean;
  /** 升起时长（ms）。 */
  riseMs?: number;
  /** 睁眼延迟（ms），从入场开始算。默认 riseMs + 110：升起停稳之后才睁眼，
   *  这样瞳孔是直接出现在最终位置，不会跟着头一起往上滑。 */
  wake?: number;
  /** 入场时地平线以上露出的比例，0–1。停稳后会解除裁切，完整显示花朵。 */
  peek?: number;
  /** 花瓣色。眼睑用同一个色，所以闭眼时会融进花里。
   *  默认对齐全站强调色 orange-500 (#FF6900)，而非 Figma 原稿的 #FF6900。 */
  petal?: string;
  /** 瞳孔最大行程（viewBox 单位）。你量出来是 16.5。 */
  travel?: number;
  /** 鼠标压在眼睛上时的保底偏移，防止眼神发空。 */
  minOffset?: number;
  /** 鼠标不在页面时回到的偏心距离。 */
  rest?: number;
  /** 鼠标不在页面时的注视方向。 */
  restQuadrant?: Quadrant;
  /** 眼白形变强度，0–1。 */
  morph?: number;
  /** 眼睑圆半径，越小弧越弯。30 以下会让眼角先于中心闭合，别用。 */
  lidRadius?: number;
  /** 一次眨眼的时长（ms）。 */
  blinkMs?: number;
  /** Bell 现象：闭眼时瞳孔上翻的像素数。 */
  bell?: number;
  /** 自动眨眼。 */
  idleBlink?: boolean;
  /** 整体跟着鼠标左右偏移+旋转的幅度，0 关闭。 */
  parallax?: number;
  /** 点哪里会眨眼：只点花本身，还是页面任意处。 */
  blinkOn?: 'self' | 'document';
  className?: string;
  style?: React.CSSProperties;
  /** 无障碍标签。留空则整体标记为装饰性。 */
  label?: string;
};

export default function DaisyPeek({
  width = 200,
  inline = false,
  verticalAlign = '-0.06em',
  rise = true,
  riseMs = 460,
  wake,
  peek = 0.72,
  petal = 'var(--color-orange-500)',
  travel = 16.5,
  minOffset = 10.5,
  rest = 11.5,
  restQuadrant = 'DL',
  morph = 0.6,
  lidRadius = 88,
  blinkMs = 400,
  bell = 3,
  idleBlink = true,
  parallax = 7,
  blinkOn = 'document',
  className,
  style,
  label,
}: DaisyPeekProps) {
  const rawId = useId();
  const uid = `daisy${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const hostRef = useRef<HTMLDivElement>(null);
  const riserRef = useRef<HTMLDivElement>(null);   // 只承载升起，和 svg 的视差分开，免得抢 transform
  const svgRef = useRef<SVGSVGElement>(null);

  // 参数放进 ref，改参数不用重启动画循环
  const p = useRef({ travel, minOffset, rest, restQuadrant, morph, lidRadius, blinkMs, bell, idleBlink, parallax, rise, riseMs, wake });
  useEffect(() => {
    p.current = { travel, minOffset, rest, restQuadrant, morph, lidRadius, blinkMs, bell, idleBlink, parallax, rise, riseMs, wake };
  }, [travel, minOffset, rest, restQuadrant, morph, lidRadius, blinkMs, bell, idleBlink, parallax, rise, riseMs, wake]);

  useEffect(() => {
    const host = hostRef.current;
    const riser = riserRef.current;
    const svg = svgRef.current;
    if (!host || !riser || !svg) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const eyes = EYES.map((e) => ({
      ...e,
      pupil: svg.querySelector<SVGCircleElement>(`#${uid}-pupil-${e.k}`)!,
      white: svg.querySelector<SVGPathElement>(`#${uid}-white-${e.k}`)!,
      clip: svg.querySelector<SVGPathElement>(`#${uid}-clip-${e.k}`)!,
      lid: svg.querySelector<SVGCircleElement>(`#${uid}-lid-${e.k}`)!,
      x: 0,
      y: 0,
      gx: 0,
      gy: 0,
    }));
    const mouth = svg.querySelector<SVGPathElement>(`#${uid}-mouth`)!;
    const solidBody = svg.querySelector<SVGPathElement>(`#${uid}-body-solid`)!;
    const dottedBody = svg.querySelector<SVGPathElement>(`#${uid}-body-dots`)!;
    if (!solidBody || !dottedBody || eyes.some((e) => !e.pupil || !e.white || !e.clip || !e.lid)) return;

    /* ---------- 眼睑几何 ---------- */
    let FULL = 0;
    let lastR = -1;
    function layoutLid() {
      const R = p.current.lidRadius;
      if (R === lastR) return;
      lastR = R;
      const sag = R - Math.sqrt(Math.max(R * R - HALF_W * HALF_W, 1));
      FULL = HALF_H * 2 + sag; // 补上弧两端的落差，否则眼角漏白
      for (const e of eyes) {
        e.lid.setAttribute('r', String(R));
        e.lid.setAttribute('cy', String(e.cy - HALF_H - R));
      }
    }
    layoutLid();

    /* ---------- 出场 ----------
       升起 → 停稳 → 才睁眼。三段分开，瞳孔不会跟着头往上滑。 */
    const doRise = p.current.rise && !reduce;
    const riseMsNow = p.current.riseMs;
    const wakeMs = reduce ? 0 : p.current.wake ?? (doRise ? riseMsNow + 110 : 0);

    // 入场前先闭眼（有 wake 才闭），并把花压到裁切线以下
    for (const e of eyes) {
      e.lid.style.transform = wakeMs > 0 ? `translateY(${FULL.toFixed(2)}px)` : 'translateY(0px)';
    }
    if (doRise) riser.style.transform = 'translateY(120%)';

    let wakeTimer: ReturnType<typeof setTimeout> | undefined;
    let riseAnimation: Animation | undefined;
    let wakeAnimations: Animation[] = [];
    let entered = false;

    const observeAnimationEnd = (animation: Animation) => {
      // Animation.cancel() rejects `finished`. Observe that expected rejection so
      // route changes and Fast Refresh cannot surface it as an unhandled promise.
      void animation.finished.catch(() => undefined);
    };

    const cancelAnimation = (animation: Animation) => {
      observeAnimationEnd(animation);
      animation.cancel();
    };

    function playEntrance() {
      if (entered) return;
      entered = true;

      if (doRise) {
        const h = host!.getBoundingClientRect().height || 1;
        riser!.style.transform = 'translateY(0px)';
        riseAnimation = riser!.animate(
          [
            { transform: `translateY(${(h * 1.15).toFixed(2)}px)` },
            { transform: `translateY(${(-h * 0.09).toFixed(2)}px)`, offset: 0.68 },
            { transform: 'translateY(0px)' },
          ],
          { duration: riseMsNow, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'none' },
        );
        observeAnimationEnd(riseAnimation);
        riseAnimation.onfinish = () => {
          // 地平线只负责入场遮罩；花停稳后完整露出，不再裁掉底部和左侧花瓣。
          host!.style.overflow = 'visible';
          startFrame();
        };
      } else {
        riser!.style.transform = 'translateY(0px)';
        host!.style.overflow = 'visible';
      }

      if (wakeMs > 0) {
        wakeTimer = setTimeout(() => {
          wakeTimer = undefined;
          wakeAnimations = eyes.map((e) => {
            e.lid.style.transform = 'translateY(0px)';
            const animation = e.lid.animate(
              [{ transform: `translateY(${FULL.toFixed(2)}px)` }, { transform: 'translateY(0px)' }],
              { duration: 340, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'none' },
            );
            observeAnimationEnd(animation);
            return animation;
          });
        }, wakeMs);
      }
    }

    /* ---------- 眨眼 ---------- */
    let anims: Animation[] = [];
    function blink() {
      if (reduce) return;
      anims.forEach((a) => a.cancel());
      const F = FULL;
      anims = eyes.map((e) =>
        e.lid.animate(
          [
            { transform: 'translateY(0px)' },
            { transform: `translateY(${(F * 0.55).toFixed(2)}px)`, offset: 0.26 },
            { transform: `translateY(${F.toFixed(2)}px)`, offset: 0.44 },
            { transform: `translateY(${F.toFixed(2)}px)`, offset: 0.52 },
            { transform: `translateY(${(F * 0.55).toFixed(2)}px)`, offset: 0.7 },
            { transform: 'translateY(0px)' },
          ],
          { duration: p.current.blinkMs, easing: 'ease-in-out', fill: 'none' },
        ),
      );
    }

    function runBlink() {
      blink();
      anims.forEach(observeAnimationEnd);
    }

    /** 读眼睑当前真实的 translateY —— Bell 现象靠它跟眼睑对齐 */
    function lidClosure(lid: SVGCircleElement) {
      const t = getComputedStyle(lid).transform;
      if (!t || t === 'none' || !FULL) return 0;
      let ty = 0;
      try {
        ty = new DOMMatrixReadOnly(t).f;
      } catch {
        const n = t.match(/-?[\d.]+/g);
        ty = n ? parseFloat(n[n.length - 1]) : 0;
      }
      return ty / FULL;
    }

    /* ---------- 自动眨眼 ---------- */
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let doubleBlinkTimer: ReturnType<typeof setTimeout> | undefined;
    function tickIdle() {
      clearTimeout(idleTimer);
      if (!p.current.idleBlink || reduce) return;
      idleTimer = setTimeout(() => {
        if (onScreen) {
          runBlink();
          // 偶尔连眨两下；间隔留够一次完整的睁开，否则第二下的上翻会不到位
          if (Math.random() < 0.22) doubleBlinkTimer = setTimeout(() => {
            if (onScreen) runBlink();
          }, p.current.blinkMs + 180);
        }
        tickIdle();
      }, 3200 + Math.random() * 4200);
    }

    /* ---------- 微眼动 ---------- */
    const sac = { x: 0, y: 0, tx: 0, ty: 0 };
    let sacTimer: ReturnType<typeof setTimeout> | undefined;
    function saccade() {
      if (reduce) return;
      if (!reduce) {
        sac.tx = (Math.random() - 0.5) * 3.4;
        sac.ty = (Math.random() - 0.5) * 2.8;
      }
      sacTimer = setTimeout(saccade, 520 + Math.random() * 1900);
    }

    /* ---------- 输入 ---------- */
    let mouse: { x: number; y: number } | null = null;
    let pointerInteractive = false;
    let focusInteractive = false;
    let dotsActive = false;
    const interactiveSelector = 'a, button, [role="button"], [data-cursor-hover]';
    const updateBodyStyle = () => {
      const next = pointerInteractive || focusInteractive;
      if (next === dotsActive) return;
      dotsActive = next;
      solidBody.style.opacity = next ? '0' : '1';
      dottedBody.style.opacity = next ? '1' : '0';
    };
    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(interactiveSelector));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') { mouse = null; return; }
      mouse = { x: e.clientX, y: e.clientY };
      pointerInteractive = isInteractive(e.target);
      updateBodyStyle();
    };
    const onLeave = () => {
      mouse = null;
      pointerInteractive = false;
      updateBodyStyle();
    };
    const onFocusIn = (e: FocusEvent) => {
      focusInteractive = isInteractive(e.target);
      updateBodyStyle();
    };
    const onFocusOut = (e: FocusEvent) => {
      focusInteractive = isInteractive(e.relatedTarget);
      updateBodyStyle();
    };
    const onDown = () => {
      // Let the initial wake finish before a click can start another lid animation.
      if (onScreen && !wakeTimer && !riser.getAnimations().length && !eyes.some((e) => e.lid.getAnimations().length)) runBlink();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    const clickTarget: Node = blinkOn === 'self' ? host : document;
    clickTarget.addEventListener('pointerdown', onDown as EventListener);

    /* ---------- 只在可见时跑循环 ---------- */
    let onScreen = false;
    let raf = 0;
    let entrancePrimeRaf = 0;
    let entranceStartRaf = 0;
    let headX = 0;
    let headR = 0;

    function startFrame() {
      if (!onScreen || raf) return;
      raf = requestAnimationFrame(frame);
    }

    function scheduleEntrance() {
      if (entered || entrancePrimeRaf || entranceStartRaf) return;
      entrancePrimeRaf = requestAnimationFrame(() => {
        entrancePrimeRaf = 0;
        entranceStartRaf = requestAnimationFrame(() => {
          entranceStartRaf = 0;
          if (!onScreen) return;
          playEntrance();
          if (!doRise || riseAnimation?.playState === 'finished') startFrame();
          tickIdle();
          saccade();
        });
      });
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasOn = onScreen;
        onScreen = entry.isIntersecting;
        if (onScreen && !wasOn) {
          if (!entered) {
            // Give the newly mounted SVG two frames to rasterize and promote its
            // transform layer before the entrance animation begins.
            scheduleEntrance();
          } else {
            if (!doRise || riseAnimation?.playState === 'finished') startFrame();
            tickIdle();
            saccade();
          }
        } else if (!onScreen && wasOn) {
          cancelAnimationFrame(entrancePrimeRaf);
          cancelAnimationFrame(entranceStartRaf);
          entrancePrimeRaf = 0;
          entranceStartRaf = 0;
          cancelAnimationFrame(raf);
          raf = 0;
          clearTimeout(idleTimer);
          clearTimeout(doubleBlinkTimer);
          clearTimeout(sacTimer);
        }
      },
      { rootMargin: '0px' },
    );
    io.observe(host);

    function frame() {
      layoutLid();

      let m: DOMPoint | null = null;
      if (mouse && svg) {
        try {
          const ctm = svg.getScreenCTM();
          if (ctm) {
            const pt = svg.createSVGPoint();
            pt.x = mouse.x;
            pt.y = mouse.y;
            m = pt.matrixTransform(ctm.inverse());
          }
        } catch {
          m = null;
        }
      }

      /* 整体：升起 + 轻微视差 */
      let tX = 0;
      let tR = 0;
      if (m && p.current.parallax > 0 && !reduce) {
        const o = clamp((m.x - VB_W / 2) / 430, -1, 1);
        tX = o * p.current.parallax;
        tR = o * p.current.parallax * 0.66;
      }
      headX = lerp(headX, tX, 0.12);
      headR = lerp(headR, tR, 0.12);
      // 只做视差；升起在外层 riser 上，两者不共用 transform
      svg!.style.transform = `translateX(${headX.toFixed(2)}px) rotate(${(headR * 0.55).toFixed(2)}deg)`;

      sac.x = lerp(sac.x, sac.tx, 0.08);
      sac.y = lerp(sac.y, sac.ty, 0.08);

      let mx = 0;
      let my = 0;
      for (const e of eyes) {
        /* 瞳孔目标：带下限，永远不回正中 */
        let tx: number;
        let ty: number;
        if (m) {
          const dx = m.x - e.cx;
          const dy = m.y - e.cy;
          const d = Math.hypot(dx, dy) || 1;
          const k = p.current.minOffset + (p.current.travel - p.current.minOffset) * Math.min(1, d / 190);
          tx = (dx / d) * k;
          ty = (dy / d) * k;
        } else {
          const r = REST_DIR[p.current.restQuadrant];
          tx = r[0] * p.current.rest;
          ty = r[1] * p.current.rest;
        }
        e.x = lerp(e.x, tx + sac.x, reduce ? 1 : 0.2);
        e.y = lerp(e.y, ty + sac.y, reduce ? 1 : 0.2);

        const bellNow = clamp(lidClosure(e.lid), 0, 1) * p.current.bell;
        e.pupil.setAttribute('transform', `translate(${e.x.toFixed(2)} ${(e.y - bellNow).toFixed(2)})`);
        mx += e.x;
        my += e.y;

        /* 归一化注视方向 → 四象限双线性插值 */
        const len = Math.hypot(e.x, e.y) || 1;
        const g = p.current.morph;
        e.gx = lerp(e.gx, clamp(e.x / len, -1, 1) * g, 0.2);
        e.gy = lerp(e.gy, clamp(e.y / len, -1, 1) * g, 0.2);

        const u = (e.gx + 1) / 2;
        const v = (e.gy + 1) / 2;
        const S = SHAPE[e.k];
        const R = PUPIL_R[e.k];
        const pts = lerpArr(lerpArr(S.UL, S.UR, u), lerpArr(S.DL, S.DR, u), v);
        const d = toPath(pts, e.cx, e.cy);
        e.white.setAttribute('d', d); // 眼白
        e.clip.setAttribute('d', d); // 遮罩用同一份 d
        e.pupil.setAttribute('r', lerp(lerp(R.UL, R.UR, u), lerp(R.DL, R.DR, u), v).toFixed(2));
      }

      /* 嘴跟着眼神挪一点，补一点“脸在转”的暗示 */
      mouth.setAttribute('transform', `translate(${((mx / 2) * 0.3).toFixed(2)} ${((my / 2) * 0.22).toFixed(2)})`);

      raf = requestAnimationFrame(frame);
    }

    return () => {
      io.disconnect();
      cancelAnimationFrame(entrancePrimeRaf);
      cancelAnimationFrame(entranceStartRaf);
      cancelAnimationFrame(raf);
      entrancePrimeRaf = 0;
      entranceStartRaf = 0;
      raf = 0;
      clearTimeout(idleTimer);
      clearTimeout(doubleBlinkTimer);
      clearTimeout(sacTimer);
      clearTimeout(wakeTimer);
      if (riseAnimation) riseAnimation.onfinish = null;
      if (riseAnimation) cancelAnimation(riseAnimation);
      wakeAnimations.forEach(cancelAnimation);
      anims.forEach(cancelAnimation);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      clickTarget.removeEventListener('pointerdown', onDown as EventListener);
    };
  }, [uid, blinkOn]);

  // 数字走 px，字符串走 calc()，这样 '1.15em' 能跟着标题字号缩放
  const ratio = VB_H / VB_W;
  const num = typeof width === 'number';
  const cssW = num ? `${width}px` : width;
  const svgH = num ? `${(width as number) * ratio}px` : `calc(${width} * ${ratio.toFixed(4)})`;
  const hostH = num ? `${(width as number) * ratio * peek}px` : `calc(${width} * ${(ratio * peek).toFixed(4)})`;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        height: hostH, // 入场时下边缘 = 地平线；停稳后解除 overflow 裁切
        overflow: 'hidden',
        display: inline ? 'inline-flex' : 'flex',
        verticalAlign: inline ? verticalAlign : undefined,
        alignItems: 'flex-start', // 入场遮罩只裁下半截，避免把花头裁掉
        justifyContent: 'center',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <div ref={riserRef} style={{ width: cssW, flex: 'none', willChange: 'transform' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flex: 'none', width: cssW, height: svgH, overflow: 'visible', willChange: 'transform' }}
      >
        <defs>
          <pattern id={`${uid}-dot-matrix`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="3.4" fill={petal} />
          </pattern>
          <clipPath id={`${uid}-clipL`}>
            <path id={`${uid}-clip-L`} d="" />
          </clipPath>
          <clipPath id={`${uid}-clipR`}>
            <path id={`${uid}-clip-R`} d="" />
          </clipPath>
        </defs>

        <path
          id={`${uid}-body-solid`}
          d={BODY_D}
          fill={petal}
          className="transition-opacity duration-200 motion-reduce:transition-none"
        />
        <path
          id={`${uid}-body-dots`}
          d={BODY_D}
          fill={`url(#${uid}-dot-matrix)`}
          opacity={0}
          className="transition-opacity duration-200 motion-reduce:transition-none"
        />

        <g>
          <path id={`${uid}-white-L`} fill="#fff" d="" />
          <g clipPath={`url(#${uid}-clipL)`}>
            <circle id={`${uid}-pupil-L`} fill="#000" cx={124.717} cy={134} r={15.4} />
            <circle
              id={`${uid}-lid-L`}
              fill={petal}
              cx={124.717}
              cy={134 - HALF_H - lidRadius}
              r={lidRadius}
              style={{ willChange: 'transform' }}
            />
          </g>
        </g>

        <g>
          <path id={`${uid}-white-R`} fill="#fff" d="" />
          <g clipPath={`url(#${uid}-clipR)`}>
            <circle id={`${uid}-pupil-R`} fill="#000" cx={199.5} cy={136.5} r={15.6} />
            <circle
              id={`${uid}-lid-R`}
              fill={petal}
              cx={199.5}
              cy={136.5 - HALF_H - lidRadius}
              r={lidRadius}
              style={{ willChange: 'transform' }}
            />
          </g>
        </g>

        <path id={`${uid}-mouth`} d={MOUTH_D} stroke="#000" strokeWidth={7} strokeLinecap="round" />
      </svg>
      </div>
    </div>
  );
}
