// Helper function to create custom start and end markers on google maps
export function buildIcons(google) {
  // Check that google maps API has loaded before we try to use it
  if (!google || !google.maps) return null;

  // Custom Start Icon it is a google.maps.Icon
  const startIcon = {
    // Instead of storing image, we store the data in url
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">\
          <circle cx="19" cy="19" r="12" fill="#10b981"/>\
          <text x="19" y="23" font-size="14" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle" fill="#ffffff">S</text>\
        </svg>'
      ),
    // // Sets where the icon is pinned on location (19,19) is center for (38,38) size
    anchor: new google.maps.Point(19, 19),
  };

  // Custom End Icon
  const endIcon = {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">\
          <circle cx="19" cy="19" r="12" fill="#ef4444"/>\
          <text x="19" y="23" font-size="14" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle" fill="#ffffff">E</text>\
        </svg>'
      ),
    anchor: new google.maps.Point(19, 19),
  };

  return { startIcon, endIcon };
}
