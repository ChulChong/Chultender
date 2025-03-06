import { recipes } from "./Recipes";

const Helper = () => {
  var acc = document.getElementsByClassName("accordion");
  var outer = document.getElementsByClassName("outer");
  var len = recipes.length;
  var i;
  var j = 0;

  while (len - 1 > j) {
    var element = acc[j];
    var target = outer[j + 1];
    if (element && target) {
      var GetbackgroundColor =
        getComputedStyle(element).getPropertyValue("background-color");
      target.style.backgroundColor = GetbackgroundColor;
    }
    j++;
    //get parent's background color
  }

  for (i = 0; i < acc.length; i++) {
    if (recipes[len - 1].id === acc[i].id) {
      acc[i].classList.toggle("active");
      var panel = acc[i].nextElementSibling;
      if (panel) {
        panel.style.maxHeight = panel.scrollHeight + 50 + "px";
        panel.style.height = panel.scrollHeight + 50 + "px";
      }
    }
    //open accordion on last child

    var x = document.getElementById(acc[i].id);
    if (x) {
      if (recipes[i].IsShow) {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
    }
    //disable unavailable cocktail

    // Remove existing event listener before adding a new one
    acc[i].removeEventListener("click", toggleAccordion);
    acc[i].addEventListener("click", toggleAccordion);
  }
};

const toggleAccordion = function () {
  this.classList.toggle("active");
  var panel = this.nextElementSibling;
  if (panel) {
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      let active = document.querySelectorAll(".accordion.active");
      for (let j = 0; j < active.length; j++) {
        active[j].classList.remove("active");
        active[j].nextElementSibling.style.maxHeight = null;
      }
      this.classList.toggle("active");
      panel.style.maxHeight = panel.scrollHeight + 50 + "px";
      panel.style.height = panel.scrollHeight + 50 + "px";
    }
  }
};

export default Helper;
