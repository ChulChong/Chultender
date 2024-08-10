import $ from "jquery";

const Helper = () => {
  const TweenLite = window.TweenLite;
  const Power3 = window.Power3;
  var $container = $(".container");
  var $tabs = $(".tab");

  var $activeTab = null;
  var height = $container.outerHeight();
  var eachHeight = height / $tabs.length;
  var collapsedHeight = 20;

  var resetTabs = function () {
    for (var idx = 0; idx < $tabs.length; idx++) {
      var $tab = $tabs.eq(idx);
      var targetY = idx * eachHeight;
      TweenLite.to($tab, 0.5, {
        y: targetY,
        ease: Power3.easeOut,
      });
    }

    $activeTab = null;
  };

  var selectTab = function (selectedIdx) {
    if ($activeTab) return resetTabs();

    $activeTab = $tabs.eq(selectedIdx);
    var targetY = null;

    for (var idx = 0; idx < $tabs.length; idx++) {
      var $tab = $tabs.eq(idx);

      if (idx <= selectedIdx) {
        targetY = idx * collapsedHeight;
      } else {
        targetY = height - collapsedHeight * ($tabs.length - idx);
      }
      TweenLite.to($tab, 0.5, {
        y: targetY,
        ease: Power3.easeOut,
      });
    }
  };

  resetTabs();

  $tabs.on("click", function (evt) {
    var idx = $tabs.index($(this));
    selectTab(idx);
  });
};

export default Helper;
