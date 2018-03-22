'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _helpers=require('./helpers');exports.default={command:'slice <source> [destination]',aliases:['s'],describe:'Slice MP3(s) from a fullfilled file',builder:function builder(yargs){return yargs.default('destination',process.cwd())},handler:function handler(argv){(0,_helpers.getInstance)({videos:getVideosFromSource(argv.source),output:argv.destination,verbose:argv.verbose}).run()}};var getVideosFromSource=function getVideosFromSource(source){return require(source.startsWith('/')?source:process.cwd()+'/'+source).videos};