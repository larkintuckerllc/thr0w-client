README v1.1.1 / 30 MARCH 2016

# Thr0w Client

## Introduction

The Thr0w Project is about building inexpensive and manageable interactive (or
not) video walls using commodity hardware, web technologies, and open source
software. The key to this solution is having one computer behind each screen
networked to a single computer acting as a server. With this design, the
splitting and synchronization of content is accomplished through software.

This repository provides the project's client-side API for the project's
required server implementation available at:

https://github.com/larkintuckerllc/thr0w-server

The Thr0w client-side API has only been tested against modern versions of
Chrome Browser.

## Installation

Download the latest version:

https://github.com/larkintuckerllc/thr0w-client/releases

The Thr0w client-side API consists of the following modules:

* Base: Provides core functionality.
* Draw: Used to create a drawing layer.
* SVG: Used to create interactive SVGs.
* Windows: Used to manage windows.

The Base module is required and it is dependent on the *socket.io.js*
library provided by the Thr0w server implementation.

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

TODO

## Contributing

TODO

## Credits

TODO

## Contact

TODO

## License

This project is licensed under GNU General Public License.
