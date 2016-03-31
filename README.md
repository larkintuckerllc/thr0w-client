README v1.1.1 / 30 MARCH 2016

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

Download the latest version:

<https://github.com/larkintuckerllc/thr0w-client/releases>

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

TODO

## Credits

TODO

## Contact

General questions and comments can be directed to <mailto:john@larkintuckerllc.com>.

## License

This project is licensed under GNU General Public License.
