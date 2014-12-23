// Sorry but we need wrap to be exposed so we can access it
var wrap;

exports.acePostWriteDomLineHTML = function(callstack, editorInfo, rep, documentAttributeManager){
  if(wrap && wrap.status() === false){ // if wrapping is disabled
    wrap.updateUI();
  }
}

// Required to bring page back into focus when caret hits first char
exports.aceEditEvent = function(hook, call){
  // If it's not a click or a key event
  var cs = call.callstack;
  if(!(cs.type == "handleClick") && !(cs.type == "handleKeyEvent")){
    return false;
  }
  // If it's an initial setup event then do nothing..
  if(cs.type == "setBaseText" || cs.type == "setup") return false;
  // A bug exists here where indented content has a selStart of 1 ;\
  setTimeout(function(){ // avoid race condition..
    if(call.rep.selStart[1] === 0){
      if(clientVars.plugins.plugins.ep_wrap.enabled){
        // Thsi is a bit jerky but it works..  Resolves https://github.com/JohnMcLear/ep_wrap/issues/3
        $('iframe[name="ace_outer"]').contents().find("#outerdocbody").scrollLeft(0);
      }
    }
  }, 250);
}

// When ACE initializes
var postAceInit = function(hook, context){
  wrap = {
    status: function(){
      return $('#options-wrap').is(':checked');
    },
    updateUI: function(){
      var maxWidth = 0;
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $innerdoc.find("div").each(function(){ // for each div
        var divWidth = 0;
        $(this).find("span").each(function(){ // for each span
          var spanWidth = $(this).context.offsetWidth;
          divWidth = divWidth + spanWidth; // get the div total width
        });
        if(divWidth > maxWidth){
          maxWidth = divWidth; // get the maximum width
        }
      });

      $outerdoc.css({"overflow":"scroll", "width":maxWidth});
      maxWidth = maxWidth+100;
      $('iframe[name="ace_outer"]').contents().find('iframe').css("cssText", "width:"+maxWidth + "px !important");  //applies to ace_inner
    },
    enable: function(){ // enables the line wrap functionality (this is the defualt behavior)
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $('iframe[name="ace_outer"]').contents().find('iframe').css("width","auto");

      $innerdoc.addClass('doesWrap');
      // $outerdoc.css({"overflow":"hidden", "width":"auto"}); /* Breaks Firefox scrolling */
      $('iframe[name="ace_outer"]').contents().find('iframe').removeAttr("style");  //applies to ace_inner

      clientVars.plugins.plugins.ep_wrap.enabled = false;

      // hide the popup dialogue
      padeditbar.toggleDropDown();
    },
    disable: function(){ // disable the line wrap functionality
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
      $innerdoc.removeClass('doesWrap');
      wrap.updateUI();
      // hide the popup dialogue
      padeditbar.toggleDropDown();

      clientVars.plugins.plugins.ep_wrap.enabled = true;

    },
    getParam: function(sname)
    {
      var params = location.search.substr(location.search.indexOf("?")+1);
      var sval = "";
      params = params.split("&");
      // split param and value into individual pieces
      for (var i=0; i<params.length; i++)
      {
        temp = params[i].split("=");
        if ( [temp[0]] == sname ) { sval = temp[1]; }
      }
      return sval;
    }
  }
  /* init */
  if($('#options-wrap').is(':checked')) {
    wrap.enable();
  } else {
    wrap.disable();
  }
  var urlContainswrapTrue = (wrap.getParam("wrap") == "true"); // if the url param is set
  if(urlContainswrapTrue){
    $('#options-wrap').attr('checked','checked');
    wrap.enable();
  }else if (wrap.getParam("wrap") == "false"){
    $('#options-wrap').attr('checked',false);
    wrap.disable();
  } 
  /* on click */
  $('#options-wrap').on('click', function() {
    if($('#options-wrap').is(':checked')) {
      wrap.enable(); // enables line wrapping
    } else {
      wrap.disable(); // disables line wrapping
    }
  });
};
exports.postAceInit = postAceInit;
