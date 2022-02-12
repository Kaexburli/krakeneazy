import { config } from 'dotenv';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const production = !process.env.ROLLUP_WATCH;

const aliases = alias({
  resolve: ['.svelte', '.js'], //optional, by default this will just look for .js files or folders
  entries: [
    { find: 'components', replacement: 'src/components' },
    { find: 'classes', replacement: 'src/classes' },
    { find: 'store', replacement: 'src/store' },
    { find: 'utils', replacement: 'src/utils' },
    { find: 'machin', replacement: 'src/xstate' },
    { find: 'lang', replacement: 'public/lang' },
  ]
});

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    json(),

    replace({
      preventAssignment: true,
      __env: JSON.stringify({ ...config({ path: __dirname + "/../.env" }).parsed }),
      'process.env.NODE_ENV': process.env.NODE_ENV,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    // Alias plugin 
    aliases
  ],
  watch: {
    clearScreen: false
  }
};
