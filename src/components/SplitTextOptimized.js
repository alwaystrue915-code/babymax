import { useRef, useEffect, useState } from 'react';

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    // Dynamically import GSAP only when component mounts
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('@gsap/react')
    ]).then(([gsapModule, scrollModule, splitModule, reactModule]) => {
      if (cancelled) return;
      
      const gsap = gsapModule.default;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      const GSAPSplitText = splitModule.SplitText;
      const useGSAP = reactModule.useGSAP;
      
      gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);
      setIsLoaded(true);
    }).catch(err => {
      console.error('Failed to load GSAP:', err);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ref.current || !text || !isLoaded) return;

    // Import again to use the registered plugins
    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.default;
      const el = ref.current;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = null;
      }

      const splitInstance = new gsap.SplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onComplete: () => {
          onLetterAnimationComplete?.();
        }
      });

      const targets = splitInstance.chars || splitInstance.words || splitInstance.lines;

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          willChange: 'transform, opacity',
          force3D: true
        }
      );

      el._rbsplitInstance = splitInstance;

      return () => {
        try {
          splitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = null;
      };
    });
  }, [text, delay, duration, ease, splitType, from, to, isLoaded, onLetterAnimationComplete]);

  const renderTag = () => {
    const style = {
      textAlign,
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'normal',
      wordWrap: 'break-word'
    };
    const classes = `split-parent ${className}`;
    const Tag = tag || 'p';

    return (
      <Tag ref={ref} style={style} className={classes}>
        {text}
      </Tag>
    );
  };
  
  return renderTag();
};

export default SplitText;
