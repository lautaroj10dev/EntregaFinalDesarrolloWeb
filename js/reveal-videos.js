document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js");

  const rows = Array.from(document.querySelectorAll(".video-row"));
  if (rows.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.25 }
    );
    rows.forEach((row) => io.observe(row));
  }

  const parent = document.getElementById("coffeeCardsAccordion");
  if (!parent || typeof bootstrap === "undefined") return;

  const collapses = Array.from(parent.querySelectorAll(".collapse"));

  collapses.forEach((el) => {
    bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });

    el.addEventListener("show.bs.collapse", () => {
      collapses.forEach((other) => {
        if (other === el) return;
        bootstrap.Collapse.getOrCreateInstance(other, { toggle: false }).hide();
      });
    });
  });
});