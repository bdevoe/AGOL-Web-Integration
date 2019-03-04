/**
 * Populates an HTML list with ArcGIS Online items from a group matching type, tag, and tagKeyword parameters.
 see https://developers.arcgis.com/rest/users-groups-and-items/search-reference.htm for more information on search queries.
 * @param  {ID} string          The element ID of the list to append data links into
 * @param  {group} string       ArcGIS Online group ID to search for items
 * @param  {type} string        Item type to return. Pass null to not used. Complete list of item types here: https://developers.arcgis.com/rest/users-groups-and-items/items-and-item-types.htm
 * @param  {tag} string         Item tag to filter results. Pass null if not used.
 * @param  {typeKeywords} string Type Keywords to further filter query. Pass null if not used. See URL for item types above for type keywords.
 * @param  {trim_title} boolean If true, removes the following prefix argument from start of item title, Defaults to False.
 * @param  {prefix} string      The prefix to remove from the start of the item title; defaults to MaineDMR.
 * @param  {link_to} string     What the link will direct to for feature services - MaineDMR Open Data page, Item page, or direct CSV or shapefile (only use with table types). Options are 'item_page', 'open_data', or 'direct' - only use direct with type = feature service. If directing to the Open Data page, the item must have only one layer and the layer name must be identical to the item name. Web Applications and Dashboards will link directly
 to the application.
 * @param  {count} int          The maximum number of items to return; defaults to 200.
 * @param  {use_snippet} boolean If true, the item snippet is appended after the hyperlink. Defaults to true.  
 */
function ListDataByTag(ID, group, type, tag, typeKeywords, trim_title, prefix, link_to, count, use_snippet) {
  $(document).ready(function() {
    // And now the query
    var query = 'https://www.arcgis.com/sharing/rest/search?q=group:' + group;
    // Add type
    if (type != null) {
    	query += '+type:' + type;
    }
    // Add tags
    if (tag != null) {
    	query += '+tags:' + tag;
    }
    // Add typeKeywords
    if (typeKeywords != null) {
    	query += '+typekeywords:' + typeKeywords;
    }
    // Add end to query
    query += '&num=' + count + '&sortField=title&f=pjson';
    // List Element ID                                                             
    var $ListData = $('#' + ID);
    $('#' + ID).html('');
    $.getJSON(query, function(data) {
      $.each(data.results, function(key, val) {
        // This will create a list of hyperlinks, with the snippet describing the item afterward
        // Any value available in the query JSON can be appended
        // Title for item
        if (trim_title == true) {
        	// Trim prefix from title, along with any leading whitespace or hyphens
        		/**
				* Remove chars from beginning of string.
				* https://gist.github.com/jonlabelle/5375315
				*/
				function ltrim(str, chars) {
				  chars = chars || WHITE_SPACES;

				  var start = 0,
				      len = str.length,
				      charLen = chars.length,
				      found = true,
				      i, c;

				  while (found && start < len) {
				      found = false;
				      i = -1;
				      c = str.charAt(start);

				      while (++i < charLen) {
				          if (c === chars[i]) {
				              found = true;
				              start++;
				              break;
				          }
				      }
				  }
				  return (start >= len) ? '' : str.substr(start, len);
				}
          var title = ltrim(val.title.replace(prefix, '').trim(), "-").trim();
        }
        else {
          var title = val.title;
        }
        // Snippet
        if (val.snippet == null) {var snippet = ''}
        else {var snippet = ' - ' + val.snippet}
        if (use_snippet == false) {var snippet = ''}
        // Build list with links
    	// For non-feature service items, link directly to item
    	if (type != 'feature_service') {
    		// Dashboards get different link
  			if (type == 'dashboard') {
  				$ListData.append('<li><a href="https://maine.maps.arcgis.com/apps/opsdashboard/index.html#/' 
  									+ val.id + '">' + title + '</a>' + snippet + '</li>');
  			}
  			else {
    			$ListData.append('<li><a href="' + val.url+ '">' + title + '</a>' + snippet + '</li>');
    		}
    	}
        else if (link_to == 'open_data') {
          $ListData.append('<li><a href="https://dmr-maine.opendata.arcgis.com/datasets/' 
                            + val.title.replace(' - ', ' ').replace(/ /g, '-').toLowerCase() + '">' 
                            + title + '</a>' + snippet + '</li>');
        }
        else if (link_to == 'item_page') {
          $ListData.append('<li><a href="' + val.url + '">' + title + '</a>' + snippet + '</li>');
        }
        else if (link_to == 'direct') {
          if (val.typeKeywords.includes("Table")) {
            $ListData.append('<li><a href="https://opendata.arcgis.com/datasets/' + val.id + '_0.csv' + '"">' 
                              + title + '</a>' + snippet + '</li>');
          }
          else {
            $ListData.append('<li><a href="https://opendata.arcgis.com/datasets/' + val.id + '_4.zip' + '"">' 
                              + title + '</a>' + snippet + '</li>');
          }          
        }
      })
    });
  });
};
