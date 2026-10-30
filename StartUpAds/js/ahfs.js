// Exact upstream first-<head> style injection, kept as text rather than HTML parsing.
(function () {
  var body = $response.body;
  var result = {};
  if (typeof body === 'string') {
    var next = body.replace(/<head>/, '<head><style>.top, .bottum, .sidebar-column, .m-menubar, .google-auto-placed, #rizhuti_v2_module_division-2, #related_posts, .post-note, .entry-share, .related-posts, #comments, #ad_position_box, .entry-copyright, .sidebar-wrapper, .home-division, #ri_home_division_widget-2, #ri_home_cmspost_widget-2, #ri_home_slider_widget-2, #ri_home_background_widget-2{display:none!important} </style>');
    if (next !== body) result.body = next;
  }
  $done(result);
})();
