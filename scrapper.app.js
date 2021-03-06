/**
 *
 * Info:
 *      Simple scrapper application that shows title, description and clickable links to a user from given URL.
 *
 * How to use:
 *      node scrapper.app.js siteName
 * 
 * Example:
 *      node scrapper.app.js google.com
 *
**/

var request             = require('request'),    
    jsdom               = require('jsdom'),
    fs                  = require('fs'),
    colors              = require('colors'),
    argv                = require('optimist').argv;
    
    colors.setTheme({ c1: 'blue', c2: 'red', c3: 'inverse' });

var myFunc = function( link, cb ){
    
    console.log( 'requesting page: '.c3 + link.c3 );

    // Step 1 - request to the page
    request({
            uri: link,
        }, function (err, response, body) {
        
        // Handle response issues
            if ( err || response.statusCode !== 200 ) {
                if ( !response ){
                    console.log( 'Ooops! page doesn`t exist or wrong URL format'.c2 )
                } else {
                    console.log('error: '+ response.statusCode )
                }
                cb();

            } else {

                console.log( 'response code: ' + response.statusCode )
                
                // Step 2 - invoking jsdom and jQuery
                jsdom.env({
                    html: body,
                    src: [
                        fs.readFileSync(__dirname + "/lib/jquery-1.9.1.min.js").toString()
                    ],
                    done: function(err, window) {
                        
                        if(err) {
                            cb();
                        } else {

                            var $ = window.$;

                            // Step 3, final part - parse content with jQuery selectors
                            console.log( '\nThis page is:\n'.c1 + $(body)[0]._ownerDocument._contentType )
                            console.log( '\nPage title: \n'.c1 + $('title').text().trim() );
                            console.log( $('head meta[name="description"]').attr('content') !== undefined ? '\nPage description: \n'.c1 + $('head meta[name="description"]').attr('content') + '\n' : '\nPage description: \n'.c1 + 'No description on the page\n'.c2);
                            console.log( '\nClickable links on the page: \n'.c1 )

                            $('a').each(function(){
                                if ( $(this).attr('href') !== undefined ){
                                    console.log( $(this).attr('href').slice(0, 4) == 'http' ? $(this).attr('href') : link + $(this).attr('href'))
                                } 
                            });

                            cb();
                        }
                    }
                })
            }
        }
    );
};

// checking if we are too lazy to add 'http://' in url parameter :)
myFunc( argv._[0].slice(0,7) == 'http://' || argv._[0].slice(0,7) == 'https:/' ? argv._[0] : 'http://' + argv._[0], function(){process.exit(1);})