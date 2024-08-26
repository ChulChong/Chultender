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
    var GetbackgroundColor =
      getComputedStyle(element).getPropertyValue("background-color");
    target.style.backgroundColor = GetbackgroundColor;
    j++;
    //get parent's background color
  }

  for (i = 0; i < acc.length; i++) {
    if (recipes[len - 1].id === acc[i].id) {
      acc[i].classList.toggle("active");
      var panel = acc[i].nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + 50 + "px";
      panel.style.height = panel.scrollHeight + 50 + "px";
    }
    //open accordion on last child

    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
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
    });
    //accordion open onclick function
  }
};

export default Helper;
