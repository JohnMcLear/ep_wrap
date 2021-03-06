// Sorry but we need wrap to be exposed so we can access it
var wrap;

exports.acePostWriteDomLineHTML = function (callstack, editorInfo, rep, documentAttributeManager) {
  if (wrap && wrap.status() === false) { // if wrapping is disabled
    wrap.updateUI();
  }
};

// Required to bring page back into focus when caret hits first char
exports.aceEditEvent = function (hook, call) {
  // If it's not a click or a key event
  const cs = call.callstack;
  if (!(cs.type == 'handleClick') && !(cs.type == 'handleKeyEvent')) {
    return false;
  }
  // If it's an initial setup event then do nothing..
  if (cs.type == 'setBaseText' || cs.type == 'setup') return false;
  // A bug exists here where indented content has a selStart of 1 ;\
  setTimeout(() => { // avoid race condition..
    if (call.rep.selStart[1] === 0) {
      if (clientVars.plugins.plugins.ep_wrap.enabled) {
        // Thsi is a bit jerky but it works..  Resolves https://github.com/JohnMcLear/ep_wrap/issues/3
        $('iframe[name="ace_outer"]').contents().find('#outerdocbody').scrollLeft(0);
      }
    }
  }, 250);
};

// When ACE initializes
var postAceInit = function (hook, context) {
  wrap = {
    status() {
      return $('#options-wrap').is(':checked');
    },
    updateUI() {
      // this is all bad.  This should be done on an edit event.
      let maxWidth = 0;
      const $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');
      const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');

      $innerdoc.find('div').each(function () { // for each div
        let divWidth = 0;
        $(this).children().each(function () { // for each span
          const spanWidth = $(this).context.offsetWidth;
          divWidth += spanWidth; // get the div total width
        });
        if (divWidth >= maxWidth) {
          maxWidth = divWidth; // get the maximum width
        }
      });
      $outerdoc.css({overflow: 'scroll', width: maxWidth});
      maxWidth += 10;
      $('iframe[name="ace_outer"]').contents().find('iframe').css('cssText', `min-width:${maxWidth}px !important`); // applies to ace_inner
    },
    enable() { // enables the line wrap functionality (this is the defualt behavior)
      const $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');
      const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');

      $('iframe[name="ace_outer"]').contents().find('iframe').css('width', 'auto');

      $innerdoc.addClass('doesWrap');
      // $outerdoc.css({"overflow":"hidden", "width":"auto"}); /* Breaks Firefox scrolling */
      $('iframe[name="ace_outer"]').contents().find('iframe').removeAttr('style'); // applies to ace_inner

      clientVars.plugins.plugins.ep_wrap.enabled = false;

      // hide the popup dialogue
      padeditbar.toggleDropDown();
    },
    disable() { // disable the line wrap functionality
      const $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');
      const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
      $innerdoc.removeClass('doesWrap');
      // hide the popup dialogue
      padeditbar.toggleDropDown();

      clientVars.plugins.plugins.ep_wrap.enabled = true;
      wrap.updateUI();
    },
    getParam(sname) {
      let params = location.search.substr(location.search.indexOf('?') + 1);
      let sval = '';
      params = params.split('&');
      // split param and value into individual pieces
      for (let i = 0; i < params.length; i++) {
        temp = params[i].split('=');
        if ([temp[0]] == sname) { sval = temp[1]; }
      }
      return sval;
    },
  };
  /* init */
  if ($('#options-wrap').is(':checked')) {
    wrap.enable();
  } else {
    wrap.disable();
  }
  const urlContainswrapTrue = (wrap.getParam('wrap') == 'true'); // if the url param is set
  if (urlContainswrapTrue) {
    $('#options-wrap').attr('checked', 'checked');
    wrap.enable();
  } else if (wrap.getParam('wrap') == 'false') {
    $('#options-wrap').attr('checked', false);
    wrap.disable();
  }
  /* on click */
  $('#options-wrap').on('click', () => {
    if ($('#options-wrap').is(':checked')) {
      wrap.enable(); // enables line wrapping
    } else {
      wrap.disable(); // disables line wrapping
    }
  });
};
exports.postAceInit = postAceInit;
