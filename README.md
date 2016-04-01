README v1.2.0 / 31 MARCH 2016

# Thr0w Client

## Introduction

The Thr0w Project is about building inexpensive and manageable interactive (or
not) video walls using commodity hardware, web technologies, and open source
software. The key to this solution is having one computer behind each screen
networked to a single computer acting as a server. With this design, the
splitting and synchronization of content is accomplished through software.

This repository provides the project's Thr0w (Client) API for the project's
required Thr0w Server implementation available at:

<https://github.com/larkintuckerllc/thr0w-server>

The Thr0w API has only been tested against modern versions of
Chrome Browser.

## Installation

Download the latest version and serve as static files from a web server:

<https://github.com/larkintuckerllc/thr0w-client/releases>

For local development, one can use one of the following to spin up a
lightweight development server.

* Python: python -m SimpleHTTPServer 8888 &
* Python 3+: python3 -m http.server 8888 &
* PHP: php -S localhost:8888
* Ruby: ruby -run -e httpd . -p 8888
* Node.js: npm install http-server -g; http-server

The Thr0w API consists of the following modules:

* Base: Provides core functionality.
* Draw: Used to create a drawing layer.
* SVG: Used to create interactive SVGs.
* Windows: Used to manage windows.

The Base module is required and it is dependent on the *socket.io.js*
library provided by the Thr0w Server implementation.

To install a module, simply add the module's CSS library to the HTML *head*,
e.g.:

```
<link rel="stylesheet" type="text/css" href="ROOT/dist/thr0w-base.css">
```

and the module's JavaScript library to the HTML *body*, e.g.,

```
<script src="ROOT/dist/thr0w-base.min.js"></script>
```

where *ROOT* is the URL path to the root folder of the download.

## Usage

Thr0w Examples, with the latest version available at:

<https://github.com/larkintuckerllc/thr0w-examples/releases>

provides inline documentation on using the Thr0w API.

The API reference is available at:

<http://rawgit.com/larkintuckerllc/thr0w-client/master/doc/index.html>

**Image**

This simple example takes a large image and splits it across three screens; it
has no interactivity.

**Animation**

This example introduces a simple interaction where-by the the left-most screen
(channel 0) animates the scene and sends update messages to the
other screens.

**Draw**

This example uses the Draw module to add a drawing overlay.

**SVG**

This example uses the SVG module to create an interactive SVG.

**Windows**

This example uses the Windows module to manage two windows.

## Contributing

Submit bug or enhancement requests using the Github *Issues* feature. Submit
bug fixes or enhancements as pull requests. Specifically, follow GitHub's
document *Contributing to Open Source on GitHub*.

<https://guides.github.com/activities/contributing-to-open-source/>

New features are to be implemented as modules, i.e., in a single CSS and
single JavaScript file. The single CSS file is to be placed in the *css*
directory named as *thr0w-MODULE.css* and the single JavaScript file is to be
placed in the *js* directory named as *thr0w-MODULE.js* replacing *MODULE*
with the name of the module.

The CSS and JavaScript need only be tested against the latest version of
Chrome Browser.

To compile, install the development dependencies using *npm* and compile with
*gulp*.

Where possible, the CSS and JavaScript is not to require any third-party
libraries (outside of the *socket.io.js* client library).

The CSS is to follow the BEM naming convention.

<https://css-tricks.com/bem-101/>

The JavaScript is to pass JSHint with the default configuration. The JavaScript
is to pass JSCS with the Google preset.

* <http://jshint.com/>
* <http://jscs.info/>

The JavaScript is to comply with the following style guide.

* Modules are to be wrapped in an Immediately Invoked Function Expression
(IIFE); no globals.
* Modules' expose their functionality as an appropriately named property on
the global *thr0w* object, e.g., *thr0w.windows* for the Windows module.
* Use named functions instead of passing an anonymous function in as a callback.
* Define functions in the scope where they are used.
* Place functions declarations at the end of the scope; rely on hoisting.

The exposed JavaScript classes (or objects) are to be documented using YUIDoc.

<http://yui.github.io/yuidoc/>

## Credits

TODO

## Contact

General questions and comments can be directed to <mailto:john@larkintuckerllc.com>.

## License

This project is licensed under GNU General Public License.
