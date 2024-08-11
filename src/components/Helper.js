const Helper = () => {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    if (acc[i].id === "wildflower") {
      var panel = acc[i].nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + 50 + "px";
      panel.style.height = panel.scrollHeight + 50 + "px";
    }

    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 50 + "px";
        panel.style.height = panel.scrollHeight + 50 + "px";
      }
    });
  }
};

export default Helper;
