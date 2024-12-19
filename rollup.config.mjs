// rollup.config.mjs
import terser from '@rollup/plugin-terser';
import css from "rollup-plugin-import-css";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'src/js/geolocation.js',
	output: [
		{
			file: 'build/geolocation.js',
			format: 'umd' //'es'
		},
		{
			file: 'build/geolocation.min.js',
			format: 'umd', //'esm',
			name: 'version',
			plugins: [terser()]
		}
	],
	plugins: [
		css({
			minify: true,
			inject: true
		}),
		nodeResolve()
	]
};
