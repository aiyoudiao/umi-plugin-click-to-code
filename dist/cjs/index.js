var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_utils = require("@umijs/utils");
var import_path = __toESM(require("path"));
function src_default(api) {
  api.logger.info("Use umi plugin clickToCode");
  api.describe({
    key: "clickToCode",
    config: {
      schema({ zod }) {
        return zod.object({
          editor: zod.string().describe(
            "默认情况下，点击将默认编辑器为vscode, 你可以设置编辑器 vscode 或者 vscode-insiders"
          ).optional()
        });
      }
    },
    enableBy: api.env === "development" ? api.EnableBy.config : () => false
  });
  api.modifyConfig((memo) => {
    const pkgPath = (0, import_path.dirname)(require.resolve("click-to-react-component"));
    memo.alias["click-to-react-component"] = pkgPath;
    return memo;
  });
  api.modifyAppData((memo) => {
    const pkgPath = (0, import_path.dirname)(require.resolve("click-to-react-component"));
    memo.clickToComponent = {
      pkgPath,
      version: "1.1.2"
    };
    return memo;
  });
  api.onGenerateFiles({
    name: "clickToCode",
    fn: () => {
      const normalizePath = import_path.default.normalize(api.paths.cwd);
      const posixCwd = normalizePath.split(import_path.default.sep).join("/");
      api.writeTmpFile({
        path: "runtime.tsx",
        content: `
import { ClickToComponent } from 'click-to-react-component';
import React from 'react';

const pathModifier = (path) => {
  return path.startsWith('${posixCwd}') ? path : '${posixCwd}/' + path;
}

export function rootContainer(container, opts) {
  return React.createElement(
    (props) => {
      return (
        <>
          <ClickToComponent editor="${api.config.clickToCode.editor || "vscode"}" pathModifier={pathModifier} />
          {props.children}
        </>
      );
    },
    opts,
    container,
  );
}
    `
      });
    }
  });
  api.addRuntimePlugin(() => {
    return [
      (0, import_utils.winPath)((0, import_path.join)(api.paths.absTmpPath, "plugin-clickToCode/runtime.tsx"))
    ];
  });
}
