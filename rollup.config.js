import babel from 'rollup-plugin-babel'

export default {
	input: 'src/index.js',
	plugins: [
		babel()
	],
	output: [
		{ file: 'dist/Draggable.cjs.js', format: 'cjs' },
		{ file: 'dist/Draggable.es.js', format: 'es' }
	],
	sourcemap: true
};
