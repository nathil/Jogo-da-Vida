$("#theme-button").click(() => {
    const theme = $("body").attr("data-bs-theme");
    $("body").attr("data-bs-theme", theme === "light" ? "dark" : "light");
});

$("#save-button").click(() => {
  interface.salvarTela();
});

$("#redefine-button").click(()=> {
    interface.redefinirTabela();
});