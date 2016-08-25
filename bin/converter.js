/*
 * H2P - HTML to PDF PHP library
 *
 * JS Converter File
 *
 * LICENSE: The MIT License (MIT)
 *
 * Copyright (C) 2013 Daniel Garajau Pereira
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @package    H2P
 * @author     Daniel Garajau <http://github.com/kriansa>
 * @copyright  2013 Daniel Garajau <http://github.com/kriansa>
 * @license    MIT License
 */

var page = require('webpage').create();
var args = require('system').args;

function errorHandler(e) {
    console.log(JSON.stringify({
        success: false,
        response: e.toString()
    }));

    // Stop the script
    phantom.exit(0);
}

try {
    if (args.length < 2) {
        throw 'You must pass the URI and the Destination param!';
    }

    // Take all options in one JSON param
    var options = JSON.parse(args[1]);

    // console.log(JSON.stringify({
    //     success: false,
    //     response: args[1]
    // }));
    // phantom.exit(0);
    // return phantom.exit(0);


    // page.customHeaders = options.request.headers;
    // phantom.cookies = options.request.cookies;
    //
    page.settings.resourceTimeout = 6000;

    page.onResourceTimeout = function(e) {
        page.reason_url = e.url;
        page.reason = e.errorString;
        console.log(JSON.stringify({
            success: false,
            response: 'Timeout'
        }));
        phantom.exit(0);
    };

    page.onResourceError = function(e) {
        page.reason = e.errorString;
        page.reason_url = e.url;
    };
    // page.open(options.request.uri + (options.request.method == 'GET' ? '?' + options.request.params : ''), options.request.method, options.request.params, function (status) {
    page.open(options.request.uri, function (status) {

        try {
            if (status !== 'success') {
                throw 'Unable to access URL: ' + page.reason_url + '\\' + page.reason;
            }

            var paperSize = {
                format: options.format,
                orientation: options.orientation,
                border: options.border
            };

            // If we enable custom footer per page, evaluate it
            // if (options.allowParseCustomFooter || options.allowParseCustomHeader) {
            //     var customOptions = page.evaluate(function() {
            //         return (typeof _h2p_options == "object"
            //             && (typeof _h2p_options.footer == "object" || typeof _h2p_options.header == "object"))
            //             ? _h2p_options : {};
            //     });
            // }

            // if (options.allowParseCustomFooter && customOptions.footer) {
            //     options.footer = options.footer || { height: '1cm', content: '' }; // Avoid some errors
            //     options.footer = {
            //         height: customOptions.footer.height || options.footer.height,
            //         content: customOptions.footer.content || options.footer.content
            //     };
            // }

            // if (options.allowParseCustomHeader && customOptions.header) {
            //     options.header = options.header || { height: '1cm', content: '' }; // Avoid some errors
            //     options.header = {
            //         height: customOptions.header.height || options.header.height,
            //         content: customOptions.header.content || options.header.content
            //     };
            // }

            // if (options.footer) {
            //     paperSize.footer = {
            //         height: options.footer.height,
            //         contents: phantom.callback(function(pageNum, totalPages) {
            //             return options.footer.content.replace('{{pageNum}}', pageNum).replace('{{totalPages}}', totalPages);
            //         })
            //     };
            // }

            // if (options.header) {
            //     paperSize.header = {
            //         height: options.header.height,
            //         contents: phantom.callback(function(pageNum, totalPages) {
            //             return options.header.content.replace('{{pageNum}}', pageNum).replace('{{totalPages}}', totalPages);
            //         })
            //     };
            // }

            page.paperSize = paperSize;
            // page.zoomFactor = options.zoomFactor;

            page.settings.dpi = 72;

            // Assumes format = 'Letter' (in inches)
            if (page.paperSize.orientation === 'landscape') {
                page.viewportSize = {
                    width: 11 * page.settings.dpi,
                    height: 8.5 * page.settings.dpi
                };
            } else {
                page.viewportSize = {
                    width: 8.5 * page.settings.dpi,
                    height: 11 * page.settings.dpi
                };
            }
            setInterval(function() {
                var ready = page.evaluate(function () {
                    return window.prerenderReady;
                });
                if (ready) {
                    page.render(options.destination, { format: 'pdf' });
                    console.log(JSON.stringify({
                        success: true,
                        response: null
                    }));
                    phantom.exit(0);
                }
            }, 500);
        } catch (e) {
            errorHandler(e);
        }
    });
} catch (e) {
    errorHandler(e);
}
