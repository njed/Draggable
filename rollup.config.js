import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
export default {
	input: 'src/main.js',
	plugins: [
		babel({
            exclude: 'node_modules/**'
		})
	],
	output: [
		{ file: 'dist/Main.cjs.js', format: 'cjs' },
		{ file: 'dist/Main.es.js', format: 'es' }
	],
	sourcemap: true
};
