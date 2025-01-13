import { winPath } from '@umijs/utils';
import path, { dirname, join } from 'path';
import { IApi } from 'umi';

export default function (api: IApi) {
  api.logger.info('Use umi plugin clickToCode');

  api.describe({
    key: 'clickToCode',
    config: {
      schema({ zod }) {
        return zod.object({
          editor: zod
            .string()
            .describe(
              '默认情况下，点击将默认编辑器为vscode, 你可以设置编辑器 vscode 或者 vscode-insiders'
            )
            .optional(),
        });
      },
    },
    enableBy: api.env === 'development' ? api.EnableBy.config : () => false,
  });

  api.modifyConfig((memo) => {
    const pkgPath = dirname(require.resolve('click-to-react-component'));
    memo.alias['click-to-react-component'] = pkgPath;
    return memo;
  });

  api.modifyAppData((memo) => {
    const pkgPath = dirname(require.resolve('click-to-react-component'));
    memo.clickToComponent = {
      pkgPath,
      version: '1.1.2',
    };
    return memo;
  });

  api.onGenerateFiles({
    name: 'clickToCode',
    fn: () => {
      const normalizePath = path.normalize(api.paths.cwd);
      const posixCwd = normalizePath.split(path.sep).join('/');
      api.writeTmpFile({
        path: 'runtime.tsx',
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
          <ClickToComponent editor="${
            api.config.clickToCode.editor || 'vscode'
          }" pathModifier={pathModifier} />
          {props.children}
        </>
      );
    },
    opts,
    container,
  );
}
    `,
      });
    },
  });

  api.addRuntimePlugin(() => {
    return [
      winPath(join(api.paths.absTmpPath, 'plugin-clickToCode/runtime.tsx')),
    ];
  });
}
