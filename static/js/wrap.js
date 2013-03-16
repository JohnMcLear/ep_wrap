var postAceInit = function(hook, context){
  var wrap = {
    enable: function() { // enables the line wrap functionality (this is the defualt behavior)
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $('iframe[name="ace_outer"]').contents().find('iframe').css("width","auto");

      $innerdoc.addClass('doesWrap');
      $outerdoc.css({"overflow":"hidden", "width":"auto"});
      $('iframe[name="ace_outer"]').contents().find('iframe').css({"width": "auto"});

      // hide the popup dialogue
      $(".popup").hide(); 
    },
    disable: function() { // disable the line wrap functionality
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
      var maxWidth = 0;

      $innerdoc.find("div").each(function(){ // for each div
        var divWidth = 0;
        $(this).find("span").each(function(){ // for each span
          var spanWidth = $(this).context.offsetWidth;
          divWidth = divWidth + spanWidth; // get the div total width
        });
        if(divWidth > maxWidth){
          maxWidth = divWidth; // get the maximum width
        }
        // console.log("Largest width line is "+maxWidth);
      });

      $('iframe[name="ace_outer"]').contents().find('iframe').css("width",maxWidth+"px");

      $innerdoc.removeClass('doesWrap');
      $outerdoc.css({"overflow":"scroll", "width":maxWidth});
      $('iframe[name="ace_outer"]').contents().find('iframe').css({"width":maxWidth + "px !important"});
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
