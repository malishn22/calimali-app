"use strict";

const path = require("path");
const babel = require("@babel/core");

const upstreamPath = process.env.METRO_SVG_UPSTREAM;
const upstream = upstreamPath ? require(upstreamPath) : require("@expo/metro-config/build/babel-transformer");

function transform(props) {
  const ext = path.extname(props.filename).toLowerCase();
  if (ext === ".svg") {
    const code = "module.exports = " + JSON.stringify(props.src) + ";";
    const ast = babel.parseSync(code, {
      filename: props.filename,
      sourceType: "module",
    });
    return { ast, metadata: {} };
  }
  return upstream.transform(props);
}

module.exports = { transform };
