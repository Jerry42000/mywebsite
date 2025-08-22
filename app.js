
const texts = [
  "University of Toronto",
  "BASc in Engineering Science",
  "Major in Electrical & Computer Engineering",
];
let partIndex  = 0,
    charIndex  = 0,
    isDeleting = false;
const typingSpeed = 100,
      pauseTime   = 2000;

function typeWriter() {
  const el = document.getElementById("typewriter");
  if (!el) return; 
  const fullText = texts[partIndex];

  if (!isDeleting) {
    el.textContent = fullText.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === fullText.length) {
      isDeleting = true;
      return setTimeout(typeWriter, pauseTime);
    }
  } else {
    el.textContent = fullText.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      partIndex = (partIndex + 1) % texts.length;
    }
  }
  setTimeout(typeWriter, isDeleting ? typingSpeed / 2 : typingSpeed);
}


function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const TO_EMAIL = "wensong.dai@mail.utoronto.ca";

  const gmailComposeURL = ({ to, subject = "", body = "" }) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;


  const mailIcon = document.getElementById("mailto-link");
  if (mailIcon) {
    mailIcon.setAttribute("href", gmailComposeURL({ to: TO_EMAIL }));
    mailIcon.setAttribute("target", "_blank");
    mailIcon.setAttribute("rel", "noopener");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd   = new FormData(form);
    const name = (fd.get("name")    || "").toString().trim();
    const from = (fd.get("email")   || "").toString().trim();
    const msg  = (fd.get("message") || "").toString().trim();

    if (!name || !from || !msg) {
      alert("Please fill in all fields.");
      return;
    }

    const subject = `Contact from ${name}`;
    const body    = `Name: ${name}\nEmail: ${from}\n\n${msg}`;


    const gmailUrl = gmailComposeURL({ to: TO_EMAIL, subject, body });
    const win = window.open(gmailUrl, "_blank", "noopener");


    if (!win) {
      window.location.href = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  });
}


function setupScrollEffects() {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;
  window.addEventListener("scroll", () => {
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = pct + "%";
  });

  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("active");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => io.observe(el));
}


function initBackground() {
  const canvas = document.getElementById("dna-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();


  const blobs = [
    { x: 0.2, y: 0.3, color: 'rgba(229,255,0,0.15)' },
    { x: 0.8, y: 0.7, color: 'rgba(0,255,255,0.15)' }
  ];
  const maxRadius = Math.max(W, H) * 0.8;


  const length     = Math.min(W, H) * 0.25;
  const segments   = 15;
  const amplitude  = 20;
  const phaseSpeed = Math.PI;
  let t = 0;

  function drawBlobs() {
    blobs.forEach((b,i) => {
      const x = W * b.x + Math.sin(t + i) * 30;
      const y = H * b.y + Math.cos(t + i) * 20;
      const grad = ctx.createRadialGradient(x,y,0,x,y,maxRadius);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
    });
  }


  function drawHelixLine(x1, y1, x2, y2) {
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const bx = x1 + (x2 - x1) * u;
      const by = y1 + (y2 - y1) * u;

      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const px = -dy / (len/segments);
      const py =  dx / (len/segments);

      const phase = u * phaseSpeed + t;
      const offset = Math.sin(phase) * amplitude;

      const hx1 = bx + px * offset;
      const hy1 = by + py * offset;
      const hx2 = bx - px * offset;
      const hy2 = by - py * offset;

      // draw rung
      ctx.strokeStyle = 'rgba(229,255,0,0.3)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(hx1, hy1);
      ctx.lineTo(hx2, hy2);
      ctx.stroke();

      // draw nodes
      ctx.fillStyle = 'rgba(0,255,255,0.4)';
      ctx.beginPath(); ctx.arc(hx1, hy1, 3, 0, 2*Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(hx2, hy2, 3, 0, 2*Math.PI); ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0,0,W,H);
    drawBlobs();


    drawHelixLine(0, H - length, length, H);


    drawHelixLine(W - length, 0, W, length);

    t += 0.015;
    requestAnimationFrame(animate);
  }
  animate();
}

document.addEventListener("DOMContentLoaded", () => {
  typeWriter();
  setupContactForm();
  setupScrollEffects();
  initBackground();


  if (window.particlesJS) {
    particlesJS("particles-js", {
      particles: {
        number:       { value: 60, density: { enable: true, value_area: 800 } },
        color:        { value: ["#E5FF00","#00FFFF"] },
        shape:        { type: "circle" },
        opacity:      { value: 0.2, random: true },
        size:         { value: 6, random: true },
        move:         { enable: true, speed: 0.6, direction: "none", out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: false }, onclick: { enable: false } }
      }
    });
  }


  const splash = document.getElementById("splash");
  const slogan = document.getElementById("slogan");
  if (splash && slogan) {
    splash.addEventListener("animationend", (e) => {
      if (e.animationName === "splashHide") {
        slogan.classList.add("slogan-show");
      }
    });
    window.addEventListener("load", () => {
      setTimeout(() => splash.classList.add("fade"), 1200);
      splash.addEventListener("animationend", e => {
        if (e.animationName === "splashOut") splash.remove();
      });
    });
  }
});


document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.proj-viewport');
  if (!viewport) return;

  const track = viewport.querySelector('.proj-track');
  const pages = Array.from(viewport.querySelectorAll('.proj-page'));
  const prevBtn = viewport.querySelector('.proj-nav.prev');
  const nextBtn = viewport.querySelector('.proj-nav.next');
  const dots = Array.from(viewport.querySelectorAll('.proj-dot'));

  let index = 0;
  const max = pages.length - 1;

  const update = () => {
    track.style.transform = `translateX(${-100 * index}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  };

  nextBtn.addEventListener('click', () => {
    index = (index >= max) ? 0 : index + 1;
    update();
  });

  prevBtn.addEventListener('click', () => {
    index = (index <= 0) ? max : index - 1;
    update();
  });

  dots.forEach((d, i) => d.addEventListener('click', () => { index = i; update(); }));

  update();
});
