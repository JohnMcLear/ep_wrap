var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var checked_state = '';

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  if (!settings.ep_wrap_default) checked_state = 'checked';
  args.content = args.content + eejs.require('ep_wrap/templates/wrap_entry.ejs', {checked : checked_state});
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb)
{
  args.content = args.content + '<link href="../static/plugins/ep_wrap/static/css/wrap.css" rel="stylesheet">';
} 
