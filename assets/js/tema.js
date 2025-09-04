function definirTema(tema) {
  localStorage.setItem("tema", tema);
  $("body").attr("data-bs-theme", tema);
}

$("#theme-button").click(() => {
  const tema = $("body").attr("data-bs-theme");
  definirTema(tema === "light" ? "dark" : "light");
});

const tema = localStorage.getItem("tema") ?? "dark";
definirTema(tema);